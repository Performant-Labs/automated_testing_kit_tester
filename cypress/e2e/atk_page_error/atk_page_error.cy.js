/**
 * atk_page_error.cy.js
 *
 * Page error tests such as 4xx, 5xx, etc.
 *
 */

/** ESLint directives */
/* eslint-disable import/first */

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

describe('Page error tests.', () => {
  //
  // Validate that 403 page appears.
  // Assumes:
  // Create a basic page with alias of "403-error-page" that has text content below.
  // admin/config/system/site-information: Default 403 (access denied) page = /403-error-page
  //
  it('(ATK-CY-1060) Validate that 403 page appears.', {tags: ['@ATK-CY-1060', '@page-error', '@smoke'] }, () => {
    const testId = 'ATK-CY-1060'
    const badAnonymousUrl = 'admin'

    cy.log('**Pull up access denied page for anonymous user with Url of ' + badAnonymousUrl + '.**')

    cy.logOutViaUi()

    cy.visit(badAnonymousUrl, {failOnStatusCode: false})
    cy.contains("403 error page")
  })

  //
  // Validate that 404 page appears.
  // Assumes:
  // Create a basic page with alias of "404-error-page" that has text content below.
  // admin/config/system/site-information: Default Default 404 (not found) page = /404-error-page
  //
  it('(ATK-CY-1061) Validate that 404 page appears.', {tags: ['@ATK-CY-1061', '@page-error', '@smoke'] }, () => {
    const testId = 'ATK-CY-1061'
    const randomString = atkUtilities.createRandomString(6)
    const badAnonymousUrl = testId + '-BadAnonymousPage-' + randomString
    const badAuthenticatedUrl = testId + '-BadAuthenticatedPage-' + randomString

    cy.log('**Pull up bad page for anonymous user with Url of ' + badAnonymousUrl + '.**')

    cy.logOutViaUi()

    cy.visit(badAnonymousUrl, {failOnStatusCode: false})
    cy.contains("404 error page")

    cy.log('**Pull up bad page for authenticated user with Url of ' + badAuthenticatedUrl + '.**')

    cy.logOutViaUi()
    cy.logInViaForm(qaUserAccounts.authenticated)

    cy.visit(badAuthenticatedUrl, {failOnStatusCode: false})
    cy.contains("404 erro page")
  })
})
