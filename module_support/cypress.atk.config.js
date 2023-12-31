/*
* Automated Testing Kit configuration.
*/
module.exports = {
  operatingMode: "native",
  drushCmd: "drush",
  registerUrl: "user/register",
  logInUrl: "user/login",
  logOutUrl: "user/logout",
  resetPasswordUrl: "user/password",
  contactUsUrl: "form/contact",
  authDir: "cypress/support",
  dataDir: "cypress/data",
  supportDir: "cypress/support",
  testDir: "cypress/e2e",
  pantheon : {
    isTarget: false,
    site: "aSite",
    environment: "dev"
    }
}
