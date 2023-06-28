/**
 * atk_commands.js
 *
 * Useful functions for Cypress.
 */

/// <reference types='Cypress' />

/** ESLint directives */
/* eslint-disable no-prototype-builtins */
/* eslint-disable import/first */

import { execSync } from 'child_process'

// https://github.com/bahmutov/cypress-log-to-term
import 'cypress-log-to-term/commands'

// Fetch the Automated Testing Kit config, which is in the project root.
import atkConfig from '../../atk.config.js'

/**
 * Create a user via Drush using a JSON user object.
 * See qaUsers.json for the definition.
 *
 * TODO: cy.exec is failing to capture the result of user:create,
 * which should provide the UID.
 * See issue: https://github.com/drush-ops/drush/issues/5660
 *
 * @param {object} user JSON user object; see qaUsers.json for the structure.
 * @param {array} roles Array of string roles to pass to Drush (machine names).
 * @param {array} args Array of string arguments to pass to Drush.
 * @param {array} options Array of string options to pass to Drush.
 */
Cypress.Commands.add('createUserWithUserObject', (user, roles = [], args = [], options = []) => {
  let cmd = 'user:create '

  if (args === undefined || !Array.isArray(args)) {
    cy.log('createUserWithUserObject: Pass an array for args.')
    return
  }

  if (options === undefined || !Array.isArray(options)) {
    cy.log('createUserWithUserObject: Pass an array for options.')
    return
  }

  args.unshift(`'${user.userName}'`)
  options.push(`--mail='${user.userEmail}'`, `--password='${user.userPassword}'`)
  cy.log(`Attempting to create: ${user.userName}. `)

  cy.execDrush(cmd, args, options).then((result) => {
    // TODO: Bring this in when execDrush reliably
    // returns results.

    // Get the UID, if present.
    // const pattern = '/Created a new user with uid ([0-9]+)/g'

    // let uid = result.match(pattern)

    // Attempt to add the roles.
    // Role(s) may come from the user object or the function arguments.
    if (user.hasOwnProperty('userRoles')) {
      user.userRoles.forEach(function (role) {
        roles.push(role)
      })
    }

    roles.forEach(function (role) {
      cmd = `user:role:add '${role}' '${user.userName}'`
      cy.execDrush(cmd)
      cy.log(`${role}: If role exists, role assigned to the user ${user.userName}`)
    })
  })
})

/**
 * Delete user via Drush given an account email.
 *
 * @param {string} email Email of account to delete.
 * @param {[string]} options Array of string options.
 */
Cypress.Commands.add('deleteUserWithEmail', (email, options = []) => {
  if (options === undefined || !Array.isArray(options)) {
    cy.log('deleteUserWithEmail: Pass an array for options.')
  }

  // TODO: --mail doesn't working without an argument.
  // See issue filed with Drush:
  // https://github.com/drush-ops/drush/issues/5652
  //
  // When that's corrected, remove 'dummy.'
  options.push(`--mail='${email}'`)
  const cmd = 'user:cancel -y '

  cy.execDrush(cmd, ['dummy'], ['--mail=' + email, '--delete-content'])
})

/**
 * Delete user via Drush given a Drupal UID.
 *
 * @param {integer} uid Drupal uid of user to delete.
 */
Cypress.Commands.add('deleteUserWithUid', (uid, options = []) => {
  if (options === undefined || !Array.isArray(options)) {
    cy.log('deleteUserWithUid: Pass an array for options.')
  }

  options.push(`--uid='${uid}'`)
  // TODO: Options isn't being passed to cy.execDrush(), create alias?
  options.push('--delete-content')
  // As of Drush 11.6 --uid doesn't work without a name argument.
  const cmd = 'user:cancel -y dummy '

  cy.execDrush(cmd, [], options)
})

/**
 * Delete user via Drush given a Drupal username.
 *
 * @param {string} userName Drupal username.
 * @param {array} args Array of string arguments to pass to Drush.
 * @param {array} options Array of string options to pass to Drush.
 */
Cypress.Commands.add('deleteUserWithUserName', (userName, args = [], options = []) => {
  const cmd = `user:cancel -y  '${userName}'`

  if (args === undefined || !Array.isArray(args)) {
    cy.log('deleteUserWithUserName: Pass an array for args.')
    return
  }

  if (options === undefined || !Array.isArray(options)) {
    cy.log('deleteUserWithUserName: Pass an array for options.')
    return
  }

  cy.log(`Attempting to delete: ${userName}. `)

  cy.execDrush(cmd, args, options)
})

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
Cypress.Commands.add('execDrush', (cmd, args = [], options = []) => {
  let output = ''

  if (args === undefined || !Array.isArray(args)) {
    cy.log('execDrush: Pass an array for arguments.')
    return
  }

  if (options === undefined || !Array.isArray(options)) {
    cy.log('execDrush: Pass an array for options.')
    return
  }

  const drushAlias = getDrushAlias()
  const argsString = args.join(' ')
  const optionsString = options.join(' ')
  const command = `${drushAlias} ${cmd} ${argsString} ${optionsString}`

  // Pantheon needs special handling.
  if (atkConfig.pantheon.isTarget) {
    // sshCmd comes from the test and is set in the before()
    return cy.execPantheonDrush(command) // Returns stdout (not wrapped).
  } else {
    cy.exec(command, { failOnNonZeroExit: false }).then((result) => {
      output = result.stdout
      cy.log('cy.exec result: ' + output)
      return cy.wrap(output, {log: false})
    })
  }
})

/**
 * Run a Pantheon Drush command via SSH.
 * Called by execDrush().
 * As of 2023-07-01, various Terminus commands, such as "terminus remote:drush", never return.
 * Using ssh tunnel instead.
 *
 * @param {string} cmd Drush command execDrush() contructs this with args and options.
 * @returns {string} The output from executing the command in a shell.
 */
Cypress.Commands.add('execPantheonDrush', (cmd) => {
  const connectCmd = `terminus connection:info ${atkConfig.pantheon.site}.${atkConfig.pantheon.environment} --format=json`

  // Ask Terminus for SFTP command to send Drush to Pantheon.
  cy.exec(connectCmd, { failOnNonZeroExit: false }).then((result) => {
    debugger
    const connections = JSON.parse(result.stdout)
    const sftpConnection = connections.sftp_command
    const envConnection = sftpConnection.replace('sftp -o Port=2222 ', '')

    // Construct the command that will talk to the Pantheon server including
    // the cmd argument.
    const remoteCmd = `ssh -T ${envConnection} -p 2222 -o 'StrictHostKeyChecking=no' -o 'AddressFamily inet' '${cmd}'`

    cy.exec(remoteCmd, { failOnNonZeroExit: false }).then((result) => {
      let output = result.stdout
      cy.log('cy.exec result: ' + output)

      return cy.wrap(output, {log: false} )
    })
  })
})

/**
 * Returns Drush alias per environment.
 * Adapt this to the mechanism that communicates to the remote server.
 *
 * @returns {string} The Drush command i.e 'lando drush ', etc.
 */
function getDrushAlias() {
  let cmd

  // Drush to Pantheon requires Terminus.
  if (atkConfig.pantheon.isTarget) {
    cmd = 'drush '
  } else {
    // Fetch the Drush command appropriate to the operating mode.
    cmd = atkConfig.drushCmd + ' '
  }
  return cmd
}

/**
 * Get Iframe body given an id.
 */
Cypress.Commands.add('getIframeBodyWithId', (iframeId) => {
  // Get the iframe > document > body
  // and retry until the body element is not empty
  return (
    cy
      .get('iframe[id=mvActiveArea]')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      // Wraps “body” DOM element to allow
      // chaining more Cypress commands, like “.find(...)”
      // https://on.cypress.io/wrap
      .then(cy.wrap, {log: false})
  )
})

/**
 * Return the UID of a user given an email.
 *
 * @param {string} email Email of the account.
 * @returns {integer} UID of user.
 */
Cypress.Commands.add('getUidWithEmail', (email) => {
  const cmd = `user:info --mail=${email} --format=json`

  cy.execDrush(cmd).then((result) => {
    if (!result === '') {
      // Fetch uid from json object, if present.
      const userJson = JSON.parse(result)

      for (const key in userJson) {
        if (userJson[key].hasOwnProperty('uid')) {
          const uidValue = userJson[key].uid
          return cy.wrap(parseInt(uidValue), {log: false}) // Exit the loop once the mail property is found.
        }
      }
    }
  })
})

/**
 * Return the Username of a user given an email.
 *
 * @param {string} email Email of the account.
 * @returns {string} Username of user.
 */
Cypress.Commands.add('getUsernameWithEmail', (email) => {
  const cmd = `user:info --mail=${email} --format=json`

  cy.execDrush(cmd).then((result) => {
    if (!result === '') {
      // Fetch uid from json object, if present.
      const userJson = JSON.parse(result)

      for (const key in userJson) {
        if (userJson[key].hasOwnProperty('name')) {
          const nameValue = userJson[key].name
          return cy.wrap(nameValue, {log: false}) // Exit the loop once the mail property is found.
        }
      }
    }
  })
})

/**
 * Log in via the login form. Test this once then switch to faster mechanisms.
 *
 * @param {object} account JSON object; see structure of qaUserAccounts.json.
 */
Cypress.Commands.add('logInViaForm', (account) => {
  const logInUrl = atkConfig.logInUrl

  Cypress.session.clearAllSavedSessions()

  cy.session(
    account.userName,
    () => {
      cy.visit(logInUrl)

      // It is ok for the username to be visible in the Command Log.
      // eslint-disable-next-line no-unused-expressions
      expect(account.userName, 'username was set').to.be.a('string').and.not.be.empty

      // But the password value should not be shown.
      if (typeof account.userPassword !== 'string' || !account.userPassword) {
        throw new Error('Missing password value..')
      }
      cy.get('#edit-name').type(account.userName, { force: true })

      // Type password and the password value should not be shown - {log: false}.
      cy.get('#edit-pass').type(account.userPassword, { log: false, force: true })

      // Click the log in button using ID.
      cy.get('#user-login-form > #edit-actions > #edit-submit').click({ force: true })
      cy.get('head meta').then(cy.log)
    },
    {
      validate() {
        cy.visit('')

        // Confirm log in worked.
        cy.get('head meta').then(cy.log)

        // Optional.
        // should('include.text', 'user')
      },
    }
  )
})

/**
 * Log in with user:login given a user id.
 *
 * @param {object} page Page object.
 * @param {integer} uid Drupal user id.
 */
Cypress.Commands.add('logInViaUli', (uid) => {
  if (uid === undefined) uid = 1

  Cypress.session.clearAllSavedSessions()

  const cmd = `user:login --uid=${uid}`

  cy.execDrush(cmd, [], ['--uri=' + Cypress.config('baseUrl')]).then((result) => {
    cy.visit(result)
  })
})

/**
 * Log out user via the UI.
 *
 * @param {object} page Page object.
 */
Cypress.Commands.add('logOutViaUi', () => {
  cy.visit(atkConfig.logOutUrl)
})

/**
 * Set Drupal configuration via Drush (cset).
 *
 * @param {string} objectName Name of configuration category.
 * @param {string} key Name of configuration setting.
 * @param {*} value Value of configuration setting.
 */
Cypress.Commands.add('setDrupalConfiguration', (objectName, key, value) => {
  const cmd = `cset -y ${objectName} ${key} ${value}`

  cy.execDrush(cmd)
})
