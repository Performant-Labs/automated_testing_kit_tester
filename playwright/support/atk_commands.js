module.exports = {
  createUserWithUserObject,
  deleteUserWithUserName,
  deleteUserWithUid,
  execDrush,
  execPantheonDrush,
  getDrushAlias,
  logInViaForm,
  loginViaUli,
  logOutViaUi,
  setDrupalConfiguration
}

const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const atkConfig = require('../../atk.config.js');

/**
 * Create a User using user object.
 *
 * @param user - Object
 */
function createUserWithUserObject(user) {
  // // Create the user.
  // let cmd = `user-create "${user.userName}" --mail="${user.userEmail}" --password="${user.userPassword}"`;

  // cy.execDrush(cmd)
  // cy.log(`${user.userName}: User created successfully.`)

  // // Assign role(s) to the user.
  // if (user.role.length > 0) {
  //   user.role.forEach(function (value) {
  //     cmd = `user-add-role "${Cypress.env('roles')[value]}" "${user.userName}"`
  //     cy.execDrush(cmd)
  //     cy.log(`${value}: Role assigned to the user ${user.userName}`)
  //   })
  // }
}

/**
 * Convenience method to delete user given a username.
 *
 * @param userName String
 */
function deleteUserWithUserName(userName) {
  const cmd = ` user:cancel -y --delete-content "${userName}"`

  console.log(`Attempting to delete: ${userName}. `)

  execDrush(cmd)

  console.log(`${userName}: User deleted successfully if present.`)
}

/**
 * Convenience method to delete user given a UID.
 *
 * @param uid String
 */
function deleteUserWithUid(uid) {
  // const cmd = `user:cancel -y --delete-content --uid="${uid}"`

  // cy.log(`${uid}: Attempting to delete.`)
  // cy.execDrush(cmd, false)   // False = ignore failed commands.
  // cy.log(`${uid}: User deleted successfully if present.`)
}

/**
 * Run drush command locally or remotely depending on the environment.
 *
 * @param command         Command to execute.
 */
function execDrush(command) {
  const drushAlias = getDrushAlias()

  // This works for all three operating modes.
  const cmd = `${drushAlias} ${command}`

  try {
    let output = execSync(cmd, { encoding: 'utf8' });
    console.log('Output: ', output);

  } catch (error) {
    // Soak up error for now.
    console.error('Error: ', error);
  }
}

/**
 * Returns drush alias per environment.
 *
 * Adapt this to the mechanism that communicates to the remote server.
 */
function getDrushAlias() {
  let cmd;

  // Drush to Pantheon requires Terminus.
  if (atkConfig.pantheon.isTarget) {
    cmd = 'terminus remote:drush ' + Cypress.config('pantheon.site') + '.' + Cypress.config('pantheon.environment') + ' -- ';
  }
  else {
    // Fetch the Drush command appropriate to the operating mode.
    cmd = atkConfig.drushCmd + " ";
  }
  return cmd;
}

/**
 * Run a Pantheon Drush command.
 *
 * @param cmd The Terminus cmd to execute.
 */
function execPantheonDrush(cmd) {
  const pantheonSite = atkConfig.pantheon.site;
  const pantheonEnvironment = atkConfig.pantheon.environment;

  // const connectCmd = `terminus connection:info ${pantheonSite}.${pantheonEnvironment} --format=json`

  // cy.exec(connectCmd)
  //   .its("stdout")
  //   .should("contain", "sftp_command")
  //   .then(function (stdout) {
  //     const connections = JSON.parse(stdout);
  //     const sftp_connection = connections.sftp_command;
  //     const env_connection = sftp_connection.replace("sftp -o Port=2222 ", "");

  //     // Produce the command that will talk to the Pantheon server.
  //     const remoteCmd = `ssh -T ${env_connection} -p 2222 -o "StrictHostKeyChecking=no" -o "AddressFamily inet" 'drush ${cmd}'`;

  //     cy.exec(remoteCmd)
  //       .its("stdout")
  //       .then ((stdout) => {
  //         cy.log(stdout)
  //         return cy.wrap(stdout);
  //       });
  //   })
}

/**
 * Log in via the login form. Test this once then switch to faster mechanisms.
 *
 * @param account - object
 */
async function logInViaForm(page, account) {
  await page.goto(atkConfig.logInUrl)
  await page.getByLabel('Username').fill(account.userName)
  await page.getByLabel('Password').fill(account.userPassword)
  await page.getByRole('button', { name: 'Log in' }).click()

  textContent = await page.textContent('body');
  expect(textContent).toContain('Member for');
}

/**
 * Log in with user:login given a user id.
 * 
 * @param uid - integer
 */
function loginViaUli(uid) {
  // if (uid == undefined) uid = 1
  // cy.makeDrushAlias().then(drushAlias => {
  //   cy.exec(
  //     `${drushAlias} user:login --uid=${uid}`, {failOnNonZeroExit: false}
  //   ).then((result) => {
  //     cy.visit(result);
  //   })
  // })
}

/**
 * Log out user via the UI.
 */
function logOutViaUi() {
  // cy.visit(atk.logoutUrl)
}

/**
 * Set configuration via drush.
 */
function setDrupalConfiguration(objectName, key, value) {
  const cmd = `cset -y ${objectName} ${key} ${value}`

  execDrush(cmd)
}