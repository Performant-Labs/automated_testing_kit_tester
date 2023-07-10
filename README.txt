INTRODUCTION
-----------

Automated Testing Kit is a suite of tests and useful utilities for end-to-end testing
using Cypress and Playwright.

DESCRIPTION
-----------

Automated Testing Kit provides functions such as:

- basic login/logout via the UI
- registration and confirmation of the email via a fake SMTP service (ethereal.email)
- awareness of the QA Accounts module
- executing drush commands via aliases or to Pantheon via Terminus and ssh

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
