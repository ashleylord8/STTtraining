const inquirer = require('inquirer');
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

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
    .then((cust) =>
      new Promise((resolve, reject) => {
        const wordParams = Object.assign({}, params, cust);
        return this.service.getWords(wordParams, (error, customization) => {
          if (error)
            reject(error);
          else
            resolve(customization);
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

  deleteCustomization(params) {
    return promptForCustomizationId(params)
    .then((customization) => new Promise((resolve, reject) =>
        this.service.deleteCustomization(customization, (error, models) => {
          if (error)
            reject(error);
          else
            resolve(models);
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
  if (params.customizationId)
    return Promise.resolve({ customization_id: params.customizationId });
  else {
    return inquirer.prompt([{
      name: 'customization_id',
      type: 'input',
      message: 'Enter your customization id:',
      validate: (value) => (value.length ? true : 'Please enter your customization id'),
    }]);
  }
}

module.exports = Commands;
