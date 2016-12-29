const inquirer = require('inquirer');
const pick = require('object.pick');
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

const pkg = require('../package.json');
const files = require('./files');

class Commands {
  constructor(options) {
    this.service = new SpeechToTextV1({
      version: 'v1',
      username: options.username,
      password: options.password,
      url: options.url || SpeechToTextV1.URL,
    });
  }

  authenticate() {
    return this.listModels();
  }

  listModels() {
    return new Promise((resolve, reject) => {
      this.service.getModels({}, (error, models) => {
        if (error)
          reject(error);
        else
          resolve(models);
      });
    });
  }

  listCustomizations() {
    return new Promise((resolve, reject) => {
      this.service.getCustomizations({}, (error, customizations) => {
        if (error)
          reject(error);
        else
          resolve(customizations);
      });
    });
  }

  listCustomizationWords(params) {
    return promptForCustomizationId(params)
    .then((customization) =>
      new Promise((resolve, reject) => {
        return this.service.getWords(customization, (error, words) => {
          if (error)
            reject(error);
          else
            resolve(words);
        });
      })
    );
  }

  getCustomization(params) {
    return promptForCustomizationId(params)
    .then((cust) => new Promise((resolve, reject) =>
        this.service.getCustomization(cust, (error, customization) => {
          if (error)
            reject(error);
          else
            resolve(customization);
        })
      )
    );
  }

  createCustomization(params) {
    return promptForCreateCustomizationParameters(params)
    .then((customization) => new Promise((resolve, reject) => {
      console.log(customization);
      console.log(reject);
      resolve();
    })
    );
  }

  deleteCustomization(params) {
    return promptForCustomizationId(params)
    .then((customization) => new Promise((resolve, reject) =>
        this.service.deleteCustomization(customization, (error) => {
          if (error)
            reject(error);
          else
            resolve();
        })
      )
    );
  }
}

/**
 * Prompt for customization identifier
 * @param  {Object} params The parameters
 */
function promptForCustomizationId(params) {
  if (params.customization_id)
    return Promise.resolve({ customization_id: params.customization_id });
  else {
    return inquirer.prompt([{
      name: 'customization_id',
      type: 'input',
      message: 'Enter your customization id:',
      validate: (value) => (value.length ? true : 'Please enter your customization id'),
    }]);
  }
}

/**
 * Prompt for create customization parameters
 * @param  {Object} params The parameters
 */
function promptForCreateCustomizationParameters(_params) {
  const params = pick(_params, ['base_model_name', 'workspace']);

  if (_params.customization_name)
    params.name = _params.customization_name;
  if (_params.customization_description)
    params.name = _params.customization_description;

  const fields = [{
    name: 'workspace',
    type: 'input',
    message: 'Enter the path to the workspace JSON file:',
    validate: (value) =>
      (files.fileExists(value) ? true :
      `"${value}" does not exist, please enter the path to the workspace JSON file`)
  },{
    name: 'name',
    type: 'input',
    default: `My Customization - ${Date.now()}`,
    message: 'Enter your customization name:',
    validate: (value) => (value.length ? true : 'Please enter your customization name'),
  },{
    name: 'description',
    type: 'input',
    default: `Created using ${pkg.name} v${pkg.version}`,
    message: 'Enter your customization description:',
    validate: (value) => (value.length ? true : 'Please enter your customization description'),
  },{
    name: 'base_model_name',
    type: 'list',
    choices: [
      'fr-FR_BroadbandModel',
      'en-US_NarrowbandModel',
      'pt-BR_BroadbandModel',
      'ja-JP_NarrowbandModel',
      'zh-CN_BroadbandModel',
      'ja-JP_BroadbandModel',
      'pt-BR_NarrowbandModel',
      'es-ES_BroadbandModel',
      'ar-AR_BroadbandModel',
      'zh-CN_NarrowbandModel',
      'en-UK_BroadbandModel',
      'es-ES_NarrowbandModel',
      'en-US_BroadbandModel',
      'en-UK_NarrowbandModel',
    ],
    default: 1,
    message: 'Select the base model',
  }].filter(f => !Object.keys(params).includes(f.name));

  if (fields.length === 0)
    return Promise.resolve(params);
  else {
    return inquirer.prompt(fields);
  }
}

module.exports = Commands;
