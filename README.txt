INTRODUCTION
-----------

Automated Testing Kit is a set of useful utilities for end-to-end testing 
using Cypress.io and Playwright.

DESCRIPTION
-----------

Automated Testing Kit provides functions such as:

- basic login/logout via the UI and API stored sessions
- registration and confirmation of the email via a fake SMTP service (ethereal.email)
- same for forgetting a password
- confirming each entry in sitemap.xml
- awareness of the QA Accounts module
- access to the translation dictionary t() from within a test
- executing drush commands via aliases or to Pantheon via Terminus (needed for 
  setup and teardown)

And this will work on the native OS (i.e. macOS/Linux), native OS + a container 
(via DDEV/Lando/Docksal) or within a container.

REQUIREMENTS
------------

This module does not have other Drupal dependencies but does require
Cypress or Playwright to be installed. See those projects for
installation instructions.


DOCUMENTATION
-------------

Find the documentation at:
https://performantlabs.com/automated-testing-kit/automated-testing-kit


INSTALLATION
------------

 * Install as you would normally install a contributed Drupal module. Visit
   https://www.drupal.org/node/1897420 for further information.
 * Installing the module without Composer is not recommended and is unsupported.


CONFIGURATION
-------------

Automated Testing Kit has a configuration page located at
/admin/automated_testing_kit/configuration.