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
  // Validate 404 page appears.
  // Assumes:
  // admin/config/system/site-information: Default 403 (access denied) page = /403-error-page
  // admin/config/system/site-information: Default Default 404 (not found) page = /404-error-page
  //
  it('(ATK-CY-1061) Validate 404 page appears.', {tags: ['@ATK-CY-1061', '@page-error', '@smoke'] }, () => {
    const randomString = atkUtilities.createRandomString(6)
    // debugger
    const anonymousBadUrl = 'ATK-CY-1060-BadAnonymousPage-' + randomString
    const authenticatedBadUrl = 'ATK-CY-1060-BadAuthenticatedPage-' + randomString
    const testId = '(ATK-CY-1061)'

    cy.log('**Pull up bad page for anonymous user with Url of ' + anonymousBadUrl + '.**')

    cy.logOutViaUi()

    cy.visit(anonymousBadUrl, {failOnStatusCode: false})
    cy.contains("ATK Error Page")

    cy.log('**Pull up bad page for authenticated user with Url of ' + authenticatedBadUrl + '.**')

    cy.logOutViaUi()
    cy.logInViaForm(qaUserAccounts.authenticated)

    cy.visit(anonymousBadUrl, {failOnStatusCode: false})
    cy.contains("ATK Error Page")
  })
})
