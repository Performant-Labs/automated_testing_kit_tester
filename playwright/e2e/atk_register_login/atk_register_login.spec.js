//
// atk_register_login.js
//
// Registration, login and forgotten password tests.

const { test, expect } = require('@playwright/test');
const atk_config = require('../../atk.config.js');

// import * as atk_utilities from '../../support/atk_utilities.js'
// import * as atk_commands from '../../support/atk_commands.js'

const userEtherealAccount = require("../../../fixtures/etherealUser.json")
const qaUserAccounts = require("../../../fixtures/qaUsers.json")

test.describe('(ATK-1000) User registration and login tasks.', () => {
  //
  // Register the Ethereal user and confirm email reaches Ethereal.
  //
  test('(ATK-1000) Register with form and confirm email with Ethereal.', async ({ page }) => {
    const logInUrl = atk_config.logInUrl

    await page.goto(logInUrl)

    // await username.fill('aangel')
    await page.getByLabel('Username').fill('aangelllll')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Log in' }).click()

  });

  // test('(ATK-1010) Login with form. ', async ({ page }) => {
  //   let logInUrl = Cypress.config("automatedTesting").logInUrl

  //   cy.logInViaForm(qaUserAccounts.authenticated)
  // }) 
});