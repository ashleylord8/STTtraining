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

  deleteModel(params) {
    console.log('deleting:', params.model_id);
    return Promise.resolve({});
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

  getModel(params) {
    return promptForModelId(params)
    .then((model) => {
      console.log(model);
      return new Promise((resolve, reject) => {
        this.service.getModel(model, (error, models) => {
          if (error)
            reject(error);
          else
            resolve(models);
        });
      });
    });
  }
}


function promptForModelId(params) {
  if (params.model_id)
    return Promise.resolve(params);
  else {
    return inquirer.prompt([{
      name: 'model_id',
      type: 'input',
      message: 'Enter your model id:',
      validate: (value) => (value.length ? true : 'Please enter your model id'),
    }]);
  }
}

module.exports = Commands;
