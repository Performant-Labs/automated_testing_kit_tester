<?php

namespace Drupal\automated_testing_kit\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * The configuration form.
 */
class ConfigurationForm extends FormBase {

  /**
   * The Messenger Service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * ConfigurationForm constructor.
   *
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   The Messenger Service.
   */
  public function __construct(MessengerInterface $messenger) {
    $this->messenger = $messenger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    $messenger = $container->get('messenger');

    return new static(
      $messenger
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'configuration_form';
  }

  /**
   * Automated Testing Kit Configuration form.
   *
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $automatedTestingKitConfig = $this->configFactory()->get('automated_testing_kit.settings');
    $configurationForm = $automatedTestingKitConfig->getRawData();

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
    ];

    return $form;
  }

  /**
   * Saves configuration.
   *
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->configFactory()->getEditable('automated_testing_kit.settings');
    $config->save(TRUE);

    $this->messenger->addMessage($this->t('Configuration saved.'));
  }

}
