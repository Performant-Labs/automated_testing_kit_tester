/// <reference types="Cypress" />

import * as at_utilities from '../../support/atk_utilities.js'
import * as at_commands from '../../support/atk_commands.js'

const userEtherealAccount = require("../../../fixtures/etherealUser.json")
const qaUserAccounts = require("../../../fixtures/qaUsers.json")

describe('User registration and login tasks.', () => {
  //
  // Register the Ethereal user and confirm email reaches Ethereal.
  //
  it.skip("(AT-1000) Register with form and confirm email with Ethereal.", {tags: ['register-login', 'anonymous', 'smoke']}, () => {
    // Clean up user in case it exists.
    cy.deleteUserWithUserName(userEtherealAccount.userName)

    cy.visit('user/register').then(() => {
      cy.get('#edit-mail').type(userEtherealAccount.userEmail)
      cy.get('#edit-name').type(userEtherealAccount.userName)
      cy.get('#user-register-form > #edit-actions > #edit-submit').click()
    })

    // Should see the thank-you message.
    cy.contains('Thank you for applying for an account.')

    // // But there shouldn't be an error on the page.
    // cy.get('.alert').should('not.exist')

    cy.clearAllSessionStorage()

    // Give the email some time to arrive.
    cy.wait(1000)

    // Check for registration email at Ethereal.
    const sentArgs = { userName: userEtherealAccount.userName, userEmail: userEtherealAccount.userEmail, userPassword: userEtherealAccount.userPassword }

    cy.origin('https://ethereal.email', { args: sentArgs }, 
      ( {userName, userEmail, userPassword} ) => {
      cy.visit('/login')
      cy.get('#address').type(userEmail)
      cy.get('#password').type(userPassword)
      cy.get('form > :nth-child(5) > .btn').click()
      cy.contains('Logged in as ' + userEmail)

      cy.visit('/messages', true)
      cy.contains('Messages for ' + userEmail)

      cy.contains('Account details for')

      // TODO: send and find a random string in the email
      // This fails when there are multiple emails with the same title.
      // Create a loop looking for the random string.
      // cy.get('tr > :nth-child(2) > a').click()
    })    
  })

  //
  // Log in with the login form into the authenticated account.
  //
  it("(AT-1010) Login with form.", {tags: ['register-login', 'authenticated', 'smoke']}, () => {
    let logInUrl = Cypress.config("automatedTesting").logInUrl

    cy.logInViaForm(qaUserAccounts.authenticated)
  })

  //
  // Log in with a POST request into the authenticated account.
  //
  it.skip("(AT-1012) Login with POST.", {tags: ['register-login', 'anonymous', 'smoke']}, () => {

  })

  //
  // Create a user with Drush from a fixture and delete it.
  //
  it.skip("(AT-1020) Create and delete user.", {tags: ['register-login', 'anonymous', 'smoke']}, () => {
    cy.deleteUserWithUserName(userEtherealAccount.userName)
    cy.createUserWithUserObject(userEtherealAccount)
    cy.deleteUserWithUserName(userEtherealAccount.userName)
  })
})
