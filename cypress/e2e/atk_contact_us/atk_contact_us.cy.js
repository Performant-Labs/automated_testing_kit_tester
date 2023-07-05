/**
 * atk_contact_us.cy.js
 *
 * Contact Us tests.
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

describe('Contact Us tests.', () => {
  //
  // Validate Contact us.
  //
  it("(ATK-CY-1050) Contact Us form accepts input, sends email.", {tags: ['ATK-CY-1050', 'contact-us', 'smoke'] }, () => {
    const uniqueToken = atkUtilities.createRandomString(6)
    const testId = '(ATK-CY-1050)'
    const subjectLine = testId + ' ' + uniqueToken

    cy.log("**Fill out contact form.**")
    cy.visit(atkConfig.contactUsUrl).then(() => {
      cy.get('#edit-name').type(userEtherealAccount.userName)
      cy.get('#edit-email').type(userEtherealAccount.userEmail)
      cy.get('#edit-subject').type(subjectLine)
      cy.get('#edit-message').type(testId)

      cy.contains('Send message').click()
    })

    cy.log("**Should see acknowledgement.**")
    cy.contains('Your message has been sent.')

    // Now check for the entry in the database.
    // Note that experiencing this problem and clearing isn't working:
    // https://github.com/cypress-io/cypress/issues/14590
    Cypress.session.clearSessionStorage

    cy.logOutViaUi()

    cy.logInViaForm(qaUserAccounts.admin)

    cy.visit('admin/structure/webform/manage/contact/results/submissions')

    // Check for presence of random string.
    // Part A passes: the submission appears.
    cy.contains(uniqueToken)

    // Check for registration email at Ethereal.
    const sentArgs = {
      userName: userEtherealAccount.userName,
      userEmail: userEtherealAccount.userEmail,
      userPassword: userEtherealAccount.userPassword,
      searchSubjectLine: subjectLine
    }

    cy.origin('https://ethereal.email', { args: sentArgs }, ({ userName, userEmail, userPassword, searchSubjectLine }) => {
      cy.visit('/login')
      cy.get('#address').type(userEmail)
      cy.get('#password').type(userPassword)
      cy.get('form > :nth-child(5) > .btn').click()
      cy.contains('Logged in as ' + userEmail)

      cy.visit('/messages', true)
      cy.contains('Messages for ' + userEmail)

      // Look for "ATK-CY-1050) uniqueToken" generated above.
      // Part B passes: the email was delivered appears.
      const subjectValue = searchSubjectLine
      cy.get('table tr').contains('td', subjectValue)
    })
  })
})
