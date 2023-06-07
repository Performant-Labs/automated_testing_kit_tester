  /*
  * Automated Testing Kit configuration for Cypress and Playwright.
  */
  module.exports = {
    operatingMode: "native",
    drushCmd: "drush",
    registerUrl: "user/register",
    logInUrl: "user/login",
    logOutUrl: "user/logout",
    pantheon : {
      isTarget: false,
      site: "aSite",
      environment: "dev"
    }
  }
