<?php

namespace Drupal\automated_testing_kit\Commands;

use Drush\Commands\DrushCommands;

/**
 * Useful Drush commands.
 */
class AutomatedTestingKitCommands extends DrushCommands {

  /**
   * Sets up Automated Testing Kit to be used by the testing tools.
   *
   * @param string $tool
   *   The tool to set up.
   *
   * @command atk:setup
   * @usage atk:setup [tool]
   */
  public function setup(string $tool) {
    // Get the file system service.
    $file_system = \Drupal::service('file_system');

    switch ($tool) {
      case 'cypress':

        $this->output()->writeln('Setting up Cypress.');
        break;

      case 'playwright':
        $this->output()->writeln('Setting up Playwright.');
        break;

      default:
        $this->output()->writeln('Command format is: drush at:setup [tool] where tool is "cypress" or "playwright."');
    }

  }

}
