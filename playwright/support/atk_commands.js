/**
 * atk_commands.js
 * 
 * Useful functions.
 * 
 */

module.exports = {
  createUserWithUserObject,
  deleteUserWithEmail,
  deleteUserWithUid,
  deleteUserWithUserName,
  execDrush,
  execPantheonDrush,
  getDrushAlias,
  getUsernameWithEmail,
  logInViaForm,
  logInViaUli,
  logOutViaUi,
  setDrupalConfiguration
}

const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');

// Fetch the Automated Testing Kit config, which is in the project root.
const atkConfig = require('../../atk.config.js');

// Fetch the Playwright config, which is in the project root.
const playwrightConfig = require('../../playwright.config.js')

/**
 * Create a user via Drush using a JSON user object.
 * See qaUsers.json for the definition.
 * 
 * @param {object} user JSON user object; see qaUsers.json for the structure.
 * @param {array} roles Array of string roles to pass to Drush (machine names).
 * @param {array} args Array of string arguments to pass to Drush.
 * @param {array} options Array of string options to pass to Drush.
 * @param {integer} The Drupal user id.
 */
function createUserWithUserObject(user, roles = [], args = [], options = []) {
  // Create the user.
  let cmd = `user:create `;

  if (!(args == undefined) && !Array.isArray(args)) {
    console.log("createUserWithUserObject: Pass an array for args.")
    exit;
  }

  if (!(options == undefined) && !Array.isArray(options)) {
    console.log("createUserWithUserObject: Pass an array for options.")
    exit;
  }

  args.unshift(`"${user.userName}"`)
  options.push(`--mail="${user.userEmail}"`, `--password="${user.userPassword}"`)
  console.log(`Attempting to create: ${user.userName}. `)

  let result = execDrush(cmd, args, options)
  
  // Get the UID, if present.
  const pattern = "/Create a new user with uid ([0-9]+)/g"
  
  // TODO: Bring this in when execDrush reliably
  // returns results.
  // let uid = result.match(pattern)
  let uid = 0

  // If successful, add the roles.
  if (Number.isInteger(uid) && uid != 0) {
    // Role(s) may come from the user object or the function arguments.
    if (user.hasOwnProperty('userRoles')) {
      user.userRoles.forEach(function (role) {
        roles.push(role)
      })
    }

    roles.forEach(function (role) {
      cmd = `user:role:add "${role}" "${user.userName}"`
      execDrush(cmd)
      console.log(`${role}: Role assigned to the user ${user.userName}`)
    })
  }
  // TODO: Returns zero currently.
  return uid
}

/**
 * Delete user via Drush given an account email.
 * 
 * @param {string} email Email of account to delete.
 * @param {[string]} options Array of string options.
 */
function deleteUserWithEmail(email, options = []) {
  if (!(options == undefined) && !Array.isArray(options)) {
    console.log("deleteUserWithEmail: Pass an array for options.")
  }

  // TODO: --mail isn't working.
  // See issue filed with Drush:
  // https://github.com/drush-ops/drush/issues/5652
  //
  // When that's fixed, replace with:
  // options.push(`--mail="${email}"`)
  // const cmd = `user:cancel -y ` 

  // Workaround is to find the username given the email.
  let username = getUsernameWithEmail(email)
  if (typeof username === "string") {
    const cmd = `user:cancel -y `

    execDrush(cmd, [`"${username}"`], options)
  }
}

/**
 * Delete user via Drush given a Drupal UID.
 * Using a workaround. See issue filed with Drush:
 * https://github.com/drush-ops/drush/issues/5652
 * 
 * @param {integer} uid Drupal uid of user to delete.
 */
function deleteUserWithUid(uid, options = []) {
  if (!(options == undefined) && !Array.isArray(options)) {
    console.log("deleteUserWithUid: Pass an array for options.")
  }

  options.push(`--uid="${uid}"`)
  const cmd = `user:cancel -y ` 

  execDrush(cmd, [], options)
}

/**
 * Delete user via Drush given a Drupal username.
 * 
 * @param {string} userName Drupal username.
 * @param {array} args Array of string arguments to pass to Drush.
 * @param {array} options Array of string options to pass to Drush.
 */
function deleteUserWithUserName(userName, args = [], options = []) {
  const cmd = `user:cancel -y  "${userName}"`

  if (!(args == undefined) && !Array.isArray(args)) {
    console.log("deleteUserWithUserName: Pass an array for args.")
    exit;
  }

  if (!(options == undefined) && !Array.isArray(options)) {
    console.log("deleteUserWithUserName: Pass an array for options.")
    exit;
  }

  console.log(`Attempting to delete: ${userName}. `)

  execDrush(cmd, args, options)
}

/**
 * Run drush command locally or remotely depending on the environment.
 * Generally you'll use this function and let it figure out
 * how to execute Drush (locally, remotely, native OS, inside container, etc.).
 * 
 * @param {string} cmd The Drush command.
 * @param {array} args Array of string arguments to pass to Drush.
 * @param {array} options Array of string options to pass to Drush.
 * @returns {string} The output from executing the command in a shell.
 */
function execDrush(cmd, args = [], options = []) {
  let output = ''

  if (!(args == undefined) && !Array.isArray(args)) {
    console.log("execDrush: Pass an array for arguments.")
    exit;
  }

  if (!(options == undefined) && !Array.isArray(options)) {
    console.log("execDrush: Pass an array for options.")
    exit;
  }

  const drushAlias = getDrushAlias()
  const argsString = args.join(' ')
  const optionsString = options.join(' ')
  const command = `${drushAlias} ${cmd} ${argsString} ${optionsString}`

  // Pantheon needs special handling.
  if (atkConfig.pantheon.isTarget) {
    // sshCmd comes from the test and is set in the before()
    return cy.execPantheonDrush(command)  // Returns stdout (not wrapped).
  }
  else {
    try {
      output = execSync(command, { encoding: 'utf8' })

      // TODO: Fix this. Output is coming back with a buffer but the 
      // line below returns and empty string.
      console.log("execSync: " + output)
    } catch (error) {
      // Soak up error.
      console.log(`Error: ${error.message}`);
    }
  }

  return output
}

/**
 * Run a Pantheon Drush command via Terminus.
 * Called by execDrush().
 * 
 * @param {string} cmd Drush command; execDrush() contructs this with args and options.
 * @returns {string} The output from executing the command in a shell.
 */
function execPantheonDrush(cmd) {
  let result
  const connectCmd = `terminus connection:info ${atkConfig.pantheon.site}.${atkConfig.pantheon.environment} --format=json`

  // Ask Terminus for SFTP command.
  result = execSync(connectCmd, { encoding: 'utf8' });

  const connections = JSON.parse(result);
  const sftp_connection = connections.sftp_command;
  const env_connection = sftp_connection.replace("sftp -o Port=2222 ", "");

  // Construct the command that will talk to the Pantheon server including
  // the cmd argument.
  const remoteCmd = `ssh -T ${env_connection} -p 2222 -o "StrictHostKeyChecking=no" -o "AddressFamily inet" 'drush ${cmd}'`;

  result = execSync(remoteCmd, { encoding: 'utf8' });

  return result
}

/**
 * Returns Drush alias per environment.
 * Adapt this to the mechanism that communicates to the remote server.
 * 
 * @returns {string} The Drush command i.e "lando drush ", etc.
 */
function getDrushAlias() {
  let cmd;

  // Drush to Pantheon requires Terminus.
  if (atkConfig.pantheon.isTarget) {
    cmd = 'terminus remote:drush ' + Cypress.config('pantheon.site') + '.' + Cypress.config('pantheon.environment') + ' -';
  }
  else {
    // Fetch the Drush command appropriate to the operating mode.
    cmd = atkConfig.drushCmd + " ";
  }
  return cmd;
}

/**
 * Return the Username of a user given an email.
 * 
 * @param {string} email Email of the account.
 * @returns {string} Username of user.
 */
function getUsernameWithEmail(email) {
  const cmd = `user:info --mail=${email} --format=json`
  const result = execDrush(cmd)

  // Fetch uid from json object, if present
  let nameValue = null
  if (!result == '') {
    // Expecting a string in json form.
    const userJson = JSON.parse(result)

    for (let key in userJson) {
      if(userJson[key].hasOwnProperty('name')) {
        nameValue = userJson[key].name;
        break;    // Exit the loop once the mail property is found.
      }
    }
  }
  return nameValue
}

/**
 * Log in via the login form. Test this once then switch to faster mechanisms.
 *
 * @param {object} page Page object.  
 * @param {object} account JSON object; see structure of qaUserAccounts.json.
 */
async function logInViaForm(page, account) {
  await page.goto(atkConfig.logInUrl)
  await page.getByLabel('Username').fill(account.userName)
  await page.getByLabel('Password').fill(account.userPassword)
  await page.getByRole('button', { name: 'Log in' }).click()

  const textContent = await page.textContent('body');
  expect(textContent).toContain('Member for');

  // Keep the stored state in the support directory.
  const authFile = atkConfig.supportDir + "/loginAuth.json"
  await page.context().storageState({path: authFile})
}

/**
 * Log in with user:login given a user id.
 * 
 * @param {object} page Page object.  
 * @param {integer} uid Drupal user id.
 */
async function logInViaUli(page, uid) {
  if (uid == undefined) uid = 1

  const cmd = `user:login --uid=${uid}`
  const url = execDrush(cmd, [], ['--uri=' + playwrightConfig.use.baseURL])
  await page.goto(url);
}

/**
 * Log out user via the UI.
 * 
 * @param {object} page Page object. 
 */
async function logOutViaUi(page) {
  const cmd = playwrightConfig.use.baseURL + '/' + atkConfig.logOutUrl
  await page.goto(cmd)
}

/**
 * Set Drupal configuration via drush.
 * 
 * @param {string} objectName Name of configuration category.
 * @param {string} key Name of configuration setting.
 * @param {*} value Value of configuration setting.
 */
function setDrupalConfiguration(objectName, key, value) {
  const cmd = `cset -y ${objectName} ${key} ${value}`

  execDrush(cmd)
}