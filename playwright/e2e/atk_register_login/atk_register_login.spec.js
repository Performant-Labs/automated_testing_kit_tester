/**
 * atk_register_login.spec.js
 * 
 * Registration, login and forgotten password tests.
 */

import * as atkCommands from '../support/atk_commands.js'
import * as atkUtilities from '../support/atk_utilities.js'

// Set up Playwright.
const { test, expect } = require('@playwright/test')

// atkConfig gets its own file.
const atkConfig = require('../../atk.config.js')

// Used to check for emails at the Ethereal fake SMTP service.
const userEtherealAccount = require("../data/etherealUser.json")

// Standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
const qaUserAccounts = require("../data/qaUsers.json")

test.describe('(ATK-1000) User registration and login tasks.', () => {
  //
  // Register the Ethereal user and confirm email reaches Ethereal.
  //
  test("(ATK-1000) Register with form and confirm email with Ethereal. @register-login @alters-db @smoke", async ({ page }) => {
    let textContent = null

    // Clean up user in case it exists. Use email because we modify the name
    // to make it easier to find the registration email in Ethereal.email.
    atkCommands.deleteUserWithEmail(userEtherealAccount.userEmail, ["--delete-content"])
  
    // Ensure user is logged out.
    atkCommands.logOutViaUi(page)

    // Begin registration.
    await page.goto(atkConfig.registerUrl)

    await page.getByLabel('Email address').fill(userEtherealAccount.userEmail)
    const extendedUserName = userEtherealAccount.userName + "-" + atkUtilities.createRandomString(6)
    await page.getByLabel('Username').fill(extendedUserName)
    await page.getByRole('button', { name: 'Create new account' }).click()

    // Should see the thank-you message.
    textContent = await page.content()
    expect(textContent).toContain('Thank you for applying for an account.');

    // Give the email some time to arrive.
    await page.waitForTimeout(1000)

    // Check for registration email at Ethereal.
    const etherealUrl = 'https://ethereal.email'
    await page.goto(etherealUrl + '/login')
    await page.getByPlaceholder('Enter email').fill(userEtherealAccount.userEmail)
    await page.getByPlaceholder('Password').fill(userEtherealAccount.userPassword)
    await page.getByRole('button', { name: 'Log in' }).click()
  
    textContent = await page.textContent('body');
    expect(textContent).toContain('Logged in as ' + userEtherealAccount.userEmail);

    await page.goto(etherealUrl + '/messages')

    textContent = await page.textContent('body');
    expect(textContent).toContain('Messages for ' + userEtherealAccount.userEmail);

    // There may be two emails, one for the user and one for the admin.
    // Look for email in the first column and the username + userCode generated above
    // in the second column; that's the user email.
    let toValue = "To: <" + userEtherealAccount.userEmail + ">"
    let subjectValue = "Account details for " + extendedUserName
    await expect(page.getByRole('row', { name: toValue + " " + subjectValue })).toBeVisible
  })

  //
  // Log in with the login form into the authenticated account.
  //
  test("(ATK-1010) Login via login form. @register-login @smoke", async ({ page }) => {
    await atkCommands.logOutViaUi(page)
    await atkCommands.logInViaForm(page, qaUserAccounts.authenticated)
  })

  //
  // Log in with a POST request into the authenticated account.
  //
  test("(ATK-1011) Login via POST. @register-login @smoke", async ({ page, request }) =>  {
    // TODO: Not ready yet.
    // await atkCommands.logOutViaUi(page)
    // await atkCommands.logInViaPost(page, request, qaUserAccounts.authenticated)
  })

  //
  // Log in with a ULI generated by Drupal.
  //
  test("(ATK-1012) Login via ULI. @register-login @smoke", async ({ page }) =>  {
    await atkCommands.logOutViaUi(page)
    await atkCommands.logInViaUli(page, 1)
  })

  //
  // Create a user with Drush from a fixture and delete it.
  //
  test("(ATK-1020) Create and delete user. @register-login @smoke", async ({ page }) =>  {
    await atkCommands.deleteUserWithUserName(userEtherealAccount.userName, [], ["--delete-content"])
    await atkCommands.createUserWithUserObject(userEtherealAccount, ["content_editor"])
    await atkCommands.deleteUserWithUserName(userEtherealAccount.userName, [], ["--delete-content"])
  })
});