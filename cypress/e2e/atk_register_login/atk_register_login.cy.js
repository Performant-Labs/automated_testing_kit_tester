/**
 * atk_register_login.cy.js
 *
 * Registration, login and forgotten password tests.
 *
 */

/// <reference types='Cypress' />

import * as atkCommands from '../../support/atk_commands.js'
import * as atkUtilities from '../../support/atk_utilities.js'

// atkConfig gets its own file.
import atkConfig from '../../../atk.config.js'

// Used to check for emails at the Ethereal fake SMTP service.
import userEtherealAccount from '../../data/etherealUser.json'

// Standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
import qaUserAccounts from '../../data/qaUsers.json'

describe('User registration and login tasks.', () => {
  //
  // Register the Ethereal user and confirm email reaches Ethereal.
  //
  it('(ATK-CY-1000) Register with form and confirm email with Ethereal.', { tags: ['register-login', 'alters-db', 'smoke'] }, () => {
    // Clean up user in case it exists.
    cy.deleteUserWithEmail(userEtherealAccount.userEmail, ['--delete-content'])

    // Ensure user is logged out.
    cy.logOutViaUi()

    // Begin registration.
    const extendedUserName = userEtherealAccount.userName + '-' + atkUtilities.createRandomString(6)
    cy.visit(atkConfig.registerUrl).then(() => {
      cy.get('#edit-mail').type(userEtherealAccount.userEmail)
      cy.get('#edit-name').type(extendedUserName)
      cy.get('#user-register-form > #edit-actions > #edit-submit').click()
    })

    // Should see the thank-you message.
    cy.contains('Thank you for applying for an account.')

    // Give the email some time to arrive.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000)

    // Check for registration email at Ethereal.
    const sentArgs = {
      userName: userEtherealAccount.userName,
      userEmail: userEtherealAccount.userEmail,
      userPassword: userEtherealAccount.userPassword,
      longUserName: extendedUserName
    }

    cy.origin('https://ethereal.email', { args: sentArgs }, ({ userName, userEmail, userPassword, longUserName }) => {
      cy.visit('/login')
      cy.get('#address').type(userEmail)
      cy.get('#password').type(userPassword)
      cy.get('form > :nth-child(5) > .btn').click()
      cy.contains('Logged in as ' + userEmail)

      cy.visit('/messages', true)
      cy.contains('Messages for ' + userEmail)

      // There may be two emails, one for the user and one for the admin.
      // Look for email in the first column and the username + userCode generated above
      // in the second column that's the user email.
      const toValue = 'To: <' + userEmail + '>'
      const subjectValue = 'Account details for ' + longUserName
      cy.get('table tr').contains('td', toValue).parent().contains('td', subjectValue)
    })
  })

  //
  // Log in with the login form into the authenticated account.
  //
  it('(ATK-CY-1010) Log in with form.', { tags: ['register-login', 'smoke'] }, () => {
    cy.logInViaForm(qaUserAccounts.authenticated)
  })

  //
  // Log in with a POST request into the authenticated account.
  //
  it.skip('(ATK-CY-1011) Log in with POST.', { tags: ['register-login', 'smoke'] }, () => {
    // TODO: Not ready yet.
    // cy.logInViaPost(qaUserAccounts.authenticated)
  })

  //
  // Log in with a ULI generated by Drupal.
  //
  it('(ATK-CY-1012) Log in via ULI.', { tags: ['register-login', 'smoke'] }, () => {
    cy.logInViaUli(1) // Log in as admin.
  })

  //
  // Create a user with Drush from a fixture and delete it.
  //
  it('(ATK-CY-1020) Create user with Drush, delete by email.', { tags: ['register-login', 'smoke'] }, () => {
    cy.deleteUserWithEmail(userEtherealAccount.userEmail, [], ['--delete-content'])
    cy.createUserWithUserObject(userEtherealAccount, ['content_editor'])
    cy.deleteUserWithEmail(userEtherealAccount.userEmail, [], ['--delete-content'])
  })

  //
  // Create a user with Drush from a fixture and delete it by UID.
  //
  it('(ATK-CY-1021) Create user with Drush, delete by UID.', { tags: ['register-login', 'smoke'] }, () => {
    cy.deleteUserWithEmail(userEtherealAccount.userEmail, [], ['--delete-content'])
    cy.createUserWithUserObject(userEtherealAccount, ['content_editor'])
    cy.getUidWithEmail(userEtherealAccount.userEmail).then((uid) => {
      cy.deleteUserWithUid(uid, [], ['--delete-content'])
    })
  })
})
