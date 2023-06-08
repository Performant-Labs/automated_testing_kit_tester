/// <reference types="Cypress" />

// https://github.com/bahmutov/cypress-log-to-term
import 'cypress-log-to-term/commands'

// Not being picked up in the config file.
// See: https://github.com/cypress-io/cypress/issues/8250
Cypress.config('defaultCommandTimeout', 5000)

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * Create a User using user object.
 *
 * @param user - Object
 */
Cypress.Commands.add('createUserWithUserObject', (user = {}) => {
  // Create the user.
  let cmd = `user-create "${user.userName}" --mail="${user.userEmail}" --password="${user.userPassword}"`;

  cy.execDrush(cmd)
  cy.log(`${user.userName}: User created successfully.`)

  // Assign role(s) to the user.
  if (user.role.length > 0) {
    user.role.forEach(function (value) {
      cmd = `user-add-role "${Cypress.env('roles')[value]}" "${user.userName}"`
      cy.execDrush(cmd)
      cy.log(`${value}: Role assigned to the user ${user.userName}`)
    })
  }
})

/**
 * Convenience method to delete user given a username.
 *
 * @param userName String
 */
Cypress.Commands.add('deleteUserWithUserName', (userName) => {
  const cmd = `user:cancel -y --delete-content "${userName}"`

  cy.log(`${userName}: Attempting to delete.`)
  cy.execDrush(cmd, false)   // False = ignore failed commands.
  cy.log(`${userName}: User deleted successfully if present.`)
})

/**
 * Convenience method to delete user given a UID.
 *
 * @param uid String
 */
Cypress.Commands.add('deleteUserWithUid', (uid) => {
  const cmd = `user:cancel -y --delete-content --uid="${uid}"`

  cy.log(`${uid}: Attempting to delete.`)
  cy.execDrush(cmd, false)   // False = ignore failed commands.
  cy.log(`${uid}: User deleted successfully if present.`)
})

/**
 * Run drush command locally or remotely depending on the environment.
 *
 * @param command         Command to execute.
 */
Cypress.Commands.add("execDrush", (command, failOnNonZeroExit) => {
  cy.getDrushAlias().then(drushAlias => {

    // Pantheon needs special handling.
    if (Cypress.config('automatedTestingKit.pantheon.isTarget')) {
      // sshCmd comes from the test and is set in the before()
      return cy.execPantheonDrush(command)  // Returns stdout (not wrapped).
    }
    else {
      // This works for all three operating modes.
      const cmd = `${drushAlias} ${command}`

      // If failOnNonZeroExit is false, pass to exec() with flag.
      if (failOnNonZeroExit === false) {
        cy.exec(cmd, {failOnNonZeroExit: false}).then( (result) => {
          return cy.wrap(result.stdout)
        })
      }
      else {
        cy.exec(cmd).then( (result) => {
          return cy.wrap(result.stdout)
        })
      }
    }
  })
})

/**
 * Run a Pantheon Drush command.
 *
 * @param cmd The Terminus cmd to execute.
 */
Cypress.Commands.add("execPantheonDrush", (cmd) => {
  const pantheonSite = Cypress.config('automatedTesting.pantheon.site');
  const pantheonEnvironment = Cypress.config('automatedTesting.pantheon.environment');

  const connectCmd = `terminus connection:info ${pantheonSite}.${pantheonEnvironment} --format=json`

  cy.exec(connectCmd)
    .its("stdout")
    .should("contain", "sftp_command")
    .then(function (stdout) {
      const connections = JSON.parse(stdout);
      const sftp_connection = connections.sftp_command;
      const env_connection = sftp_connection.replace("sftp -o Port=2222 ", "");

      // Produce the command that will talk to the Pantheon server.
      const remoteCmd = `ssh -T ${env_connection} -p 2222 -o "StrictHostKeyChecking=no" -o "AddressFamily inet" 'drush ${cmd}'`;

      cy.exec(remoteCmd)
        .its("stdout")
        .then ((stdout) => {
          cy.log(stdout)
          return cy.wrap(stdout);
        });
    })
});

/**
 * Returns drush alias per environment.
 *
 * Adapt this to the mechanism that communicates to the remote server.
 */
Cypress.Commands.add("getDrushAlias", () => {
  let cmd;

  // Drush to Pantheon requires Terminus.
  if (Cypress.config().automatedTesting.pantheon.isTarget) {
    cmd = 'terminus remote:drush ' + Cypress.config('pantheon.site') + '.' + Cypress.config('pantheon.environment') + ' -- ';
  }
  else {
    // Fetch the Drush command appropriate to the operating mode.
    cmd = Cypress.config().automatedTesting.drushCmd + " ";
  }
  return cy.wrap(cmd);
})

/**
 * Get Iframe body given an id.
 */
Cypress.Commands.add('getIframeBodyWithId', (iframeId) => {
  // Get the iframe > document > body
  // and retry until the body element is not empty
  return cy
    .get('iframe[id=mvActiveArea]')
    .its('0.contentDocument.body').should('not.be.empty')
    // Wraps “body” DOM element to allow
    // chaining more Cypress commands, like “.find(...)”
    // https://on.cypress.io/wrap
    .then(cy.wrap)
})

/**
 * Log in via the login form. Test this once then switch to faster mechanisms.
 *
 * @param account - object
 */
Cypress.Commands.add("logInViaForm", (account) => {
  let logInUrl = Cypress.config("automatedTesting").logInUrl

  Cypress.session.clearAllSavedSessions()

  cy.session(account.userName, () => {
      cy.visit(logInUrl)

      // It is ok for the username to be visible in the Command Log.
      expect(account.userName, 'username was set').to.be.a('string').and.not.be.empty

      // But the password value should not be shown.
      if (typeof account.userPassword !== 'string' || !account.userPassword) {
        throw new Error('Missing password value..')
      }
      cy.get('#edit-name').type(account.userName, { force: true })

      // Type password and the password value should not be shown - {log: false}.
      cy.get('#edit-pass').type(account.userPassword, { log: false , force: true })

      // Click the log in button using ID.
      cy.get('#edit-actions > #edit-submit').click({ force: true })
      cy.get('head meta').then(console.log)
    },
    {
      validate() {
        cy.visit('')

        // Confirm log in worked.
        cy.get('head meta').then(console.log)

        // Optional.
        //should('include.text', 'user')
      }
    }
  )
})

/**
 * Log in via the login form. Test this once then switch to faster mechanisms.
 *
 * @param account - object
 */
Cypress.Commands.add("logInViaPost", (account) => {
  let logInUrl = Cypress.config("automatedTesting").logInUrl

  Cypress.session.clearAllSavedSessions()

  cy.session(qaUserAccounts.authenticated.userName, () => {
    cy.visit(logInUrl)

    cy.request({
      method: 'POST',
      url: '/user/login',
      form: true,
      body: {
        name: account.userName,
        pass: account.userPassword,
        form_id: 'user_login_form'
      }
    }).then((response) => {
      // Assert the response status code.
      expect(response.status).to.equal(200);

      // Optionally assert any expected response data aside from the
      // 200 response code above.
      // For example, check for a specific success message.
      // expect(response.body.message).to.equal('Login successful');
    })
  })
})

/**
 * Log in with user:login given a user id.
 * 
 * @param uid - integer
 */
Cypress.Commands.add('loginViaUli', (uid) => {
  if (uid == undefined) uid = 1
  cy.makeDrushAlias().then(drushAlias => {
    cy.exec(
      `${drushAlias} user:login --uid=${uid}`, {failOnNonZeroExit: false}
    ).then((result) => {
      cy.visit(result);
    })
  })
})


/**
 * Log out user via the UI.
 */
Cypress.Commands.add('logOutViaUi', () => {
  let logOutUrl = Cypress.config("automatedTesting").logoutUrl

  cy.visit(logoutUrl)
})

/**
 * Prepare for test run.
 *
 * TODO: Figure out how to get this to run only once.
 * Until then, put code in the CI.
 */
Cypress.Commands.add("prepareForTestRun", () => {
  // Set the Honeypot time limit to 0.
  // cy.log("**Setting Honeypot time limit to 0.**")
  // cy.setDrupalConfiguration('honeypot.settings', 'time_limit', '0')

  // Uninstall honeypot and coffee.
  // Coffee is presenting an overlay that is hiding other elements.
  // cy.log("**Uninstall Honeypot and Coffee.**")
  // cy.execDrush('pmu -y coffee honeypot')
  // cy.wait(2000)
})


/**
 * Set configuration via drush.
 */
Cypress.Commands.add('setDrupalConfiguration', (objectName, key, value) => {
  const cmd = `cset -y ${objectName} ${key} ${value}`

  cy.execDrush(cmd)
})