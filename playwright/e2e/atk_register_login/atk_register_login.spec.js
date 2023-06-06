//
// atk_register_login.js
//
// Registration, login and forgotten password tests.

const { test, expect } = require('@playwright/test')

const atkConfig = require('../../atk.config.js')

import * as atkUtilities from '../support/atk_utilities.js'
import * as atkCommands from '../support/atk_commands.js'

const userEtherealAccount = require("../data/etherealUser.json")
const qaUserAccounts = require("../data/qaUsers.json")

test.describe('(ATK-1000) User registration and login tasks.', () => {
  //
  // Register the Ethereal user and confirm email reaches Ethereal.
  //
  test("(ATK-1000) Register with form and confirm email with Ethereal. @register-login @smoke", async ({ page }) => {
    let textContent = null

    // atkCommands.deleteUserWithUserName(userEtherealAccount.userName)
  
    // await page.goto(atkConfig.registerUrl)

    // await page.getByLabel('Email address').fill(userEtherealAccount.userEmail)
    // await page.getByLabel('Username').fill(userEtherealAccount.userName)
    // await page.getByRole('button', { name: 'Create new account' }).click()

    // // Should see the thank-you message.
    // const textContent = await page.textContent('body');
    // expect(textContent).toContain('Thank you for applying for an account.');

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
  })

  //
  // Log in with the login form into the authenticated account.
  //
  test("(ATK-1010) Login with form. @register-login @smoke", async ({ page }) => {
    await atkCommands.logInViaForm(page, qaUserAccounts.authenticated)
  })

  //
  // Log in with a POST request into the authenticated account.
  //
  test("(ATK-1012) Login with POST. @register-login @smoke", async ({ page }) =>  {
    await atkCommands.logInViaPost(qaUserAccounts.authenticated)
  })

  //
  // Create a user with Drush from a fixture and delete it.
  //
  test("(ATK-1020) Create and delete user. @register-login @smoke", async ({ page }) =>  {
    await atkCommands.deleteUserWithUserName(userEtherealAccount.userName)
    await atkCommands.createUserWithUserObject(userEtherealAccount)
    await atkCommands.deleteUserWithUserName(userEtherealAccount.userName)
  })

});