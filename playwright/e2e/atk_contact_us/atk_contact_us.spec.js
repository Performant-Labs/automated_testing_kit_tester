/**
 * atk_contact_us.spec.js
 *
 * Contact Us tests.
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

test.describe('Contact Us tests.', () => {
  //
  // Validate Contact us.
  //
  test('(ATK-PW-1050)  Contact Us form accepts input, sends email. @ATK-PW-1050 @contact-us @smoke', async ({ page, context }) => {
    const uniqueToken = atkUtilities.createRandomString(6)
    const testId = '(ATK-PW-1050)'
    const subjectLine = testId + ' ' + uniqueToken
    let textContent = ''

    // Begin registration.
    await page.goto(atkConfig.contactUsUrl)

    await page.getByLabel('Your name').fill(userEtherealAccount.userName)
    await page.getByLabel('Your email').fill(userEtherealAccount.userEmail)
    await page.getByLabel('Subject').fill(subjectLine)
    await page.getByLabel('Message').fill(testId)
    await page.getByRole('button', { name: 'Send message' }).click()

    // Should see the thank-you message.
    textContent = await page.content()
    expect(textContent).toContain('Your message has been sent.')

    // Now check for the entry in the database.
    await atkCommands.logOutViaUi(page, context)

    await atkCommands.logInViaForm(page, context, qaUserAccounts.admin)

    await page.goto('admin/structure/webform/manage/contact/results/submissions')

    // Check for presence of random string.
    // Part A passes: the submission appears.
    textContent = await page.content()
    expect(textContent).toContain(uniqueToken)

    // Check for registration email at Ethereal.
    const etherealUrl = 'https://ethereal.email'
    await page.goto(etherealUrl + '/login')
    await page.getByPlaceholder('Enter email').fill(userEtherealAccount.userEmail)
    await page.getByPlaceholder('Password').fill(userEtherealAccount.userPassword)
    await page.getByRole('button', { name: 'Log in' }).click()

    textContent = await page.textContent('body')
    expect(textContent).toContain('Logged in as ' + userEtherealAccount.userEmail)

    await page.goto(etherealUrl + '/messages')

    textContent = await page.textContent('body')
    expect(textContent).toContain('Messages for ' + userEtherealAccount.userEmail)

    // Look for "ATK-CY-1050) uniqueToken" generated above.
    await expect(page.getByRole('row', { subject: subjectLine })).toBeVisible
  })
})
