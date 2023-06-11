/*
* Automated Testing Kit configuration.
*/
module.exports = {
  operatingMode: "native",
  drushCmd: "drush",
  registerUrl: "user/register",
  logInUrl: "user/login",
  logOutUrl: "user/logout",
  testDir: "tests",
  authDir: "tests/support",
  dataDir: "tests/data",
  supportDir: "tests/support",
  pantheon : {
    isTarget: false,
    site: "aSite",
    environment: "dev"
  }
}
