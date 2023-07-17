/**
 * atk_page_error.spec.js
 *
 * Page error tests such as 4xx, 5xx, etc.
 *
 */

/** ESLint directives */
/* eslint-disable import/first */

import * as atkCommands from '../support/atk_commands.js'
import * as atkUtilities from '../support/atk_utilities.js'

// Set up Playwright.
const { test, expect } = require('@playwright/test')

// atkConfig gets its own file.
import atkConfig from '../../atk.config.js'

// Used to check for emails at the Ethereal fake SMTP service.
import userEtherealAccount from '../data/etherealUser.json'

// Standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
import qaUserAccounts from '../data/qaUsers.json'

test.describe('Page error tests.', () => {
  //
  // Validate that 403 page appears.
  // Assumes:
  // Create a basic page with alias of "403-error-page" that has text content below.
  // admin/config/system/site-information:Default 403 (access denied) page = /403-error-page
  //
  test('(ATK-PW-1060) Validate that 403 page appears. @ATK-PW-1060 @page-error @smoke', async ({ page, context }) => {
    const testId = 'ATK-PW-1060'
    const badAnonymousUrl = "admin"

    console.log('Pull up access denied page for anonymous user with Url of ' + badAnonymousUrl + '.')

    await atkCommands.logOutViaUi(page, context)
    await page.goto(badAnonymousUrl)

    // Should see the 403 message.
    let textContent = ''
    textContent = await page.content()
    expect(textContent).toContain('403 error page')
  })

  //
  // Validate that 404 page appears.
  // Assumes:
  // Create a basic page with alias of "404-error-page" that has text content below.
  // Set admin/config/system/site-information:Default 404 (not found) page = /404-error-page
  //
  test('(ATK-PW-1061) Validate that 404 page appears. @ATK-PW-1061 @page-error @smoke', async ({ page, context }) => {
    const testId = 'ATK-PW-1061'
    const randomString = atkUtilities.createRandomString(6)
    const badAnonymousUrl = testId + '-BadAnonymousPage-' + randomString
    const badAuthenticatedUrl = testId + '-BadAuthenticatedPage-' + randomString

    console.log('Pull up bad page for anonymous user with Url of ' + badAnonymousUrl + '.')

    await atkCommands.logOutViaUi(page, context)
    await page.goto(badAnonymousUrl)

    // Should see the 404 message.
    let textContent = ''
    textContent = await page.content()
    expect(textContent).toContain('404 error page')

    console.log('Pull up bad page for authenticated user with Url of ' + badAuthenticatedUrl + '.')

    await atkCommands.logInViaForm(page, context, qaUserAccounts.authenticated)
    await page.goto(badAuthenticatedUrl)

    // Should see the 404 message.
    textContent = await page.content()
    expect(textContent).toContain('404 error page')
  })
})
