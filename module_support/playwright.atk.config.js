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
  authDir: "tests/support",
  dataDir: "tests/data",
  supportDir: "tests/support",
  testDir: "tests",
  pantheon : {
    isTarget: false,
    site: "aSite",
    environment: "dev"
  }
}
