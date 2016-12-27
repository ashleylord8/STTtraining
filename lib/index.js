#!/usr/bin/env node --harmony

require('colors');

const program = require('commander');
const inquirer = require('inquirer');
const pick = require('object.pick');
const Preferences = require('preferences');
const clui = require('clui');
const spinner = clui.Spinner;

const pkg = require('../package.json');
const CommandManager = require('./commands');
const prefs = new Preferences(`com.ibm.watson.${pkg.name}`);

function getCredentials(opts) {
  const creds = ['username', 'password'];
  if (opts && opts.username && opts.password) {
    return pick(opts, creds);
  } else if (program.username && program.password) {
    return pick(program, creds);
  } else if (prefs.username && prefs.password) {
    return pick(prefs, creds);
  } else {
    console.log('No Watson Speech to text credentials has been specified.'.yellow);
    console.log(`Please set one using: $ ${pkg.name} authenticate`);
    process.exit(1);
  }
}

/**
 * Creates a command manager using the credentials provided by the user
 * or stored in preferences.
 *
 * @param  {Object} userCredentials The username and password provided in the command.
 */
function getCommands(userCredentials) {
  return new CommandManager(getCredentials(userCredentials));
}

/**
 * Prints the Error and exit the program.
 */
function processError(error) {
  let message = 'There was an error processing the request, please try again.';
  if (error) {
    if (error.error) {
      message = error.code ? `${error.code} - ` : '';
      message = message + error.error;
    } else {
      message = error.toString();
    }
  }
  console.log(message.red);
  process.exit(1);
}

/**
 * Prompt the user for username and password
 * @param  {Object} userCredentials The user provided credentials
 */
function promptForCredentials (userCredentials) {
  if (userCredentials.username && userCredentials.password) {
    return Promise.resolve(userCredentials);
  } else {
    return inquirer.prompt([{
      name: 'password',
      type: 'input',
      message: 'Enter your Speech to Text password:',
      validate: (value) => (value.length ? true : 'Please enter your Speech to Text password'),
    },{
      name: 'username',
      type: 'input',
      message: 'Enter your Speech to Text username:',
      validate: (value) => (value.length ? true : 'Please enter your Speech to Text username'),
    }]);
  }
}

program.version(pkg.version)
  .usage('<command> [options]');

program
  .command('set-credentials')
  .description('Set Speech to Text username and password')
  .option('-u, --username <username>', 'Speech to text username')
  .option('-p, --password <password>', 'Speech to text password')
  .action((cmd) => {
    promptForCredentials(cmd)
    .then((credentials) => {
      const status = new spinner('Authenticating, please wait...');
      status.start();
      return getCommands(credentials)
      .authenticate()
      .then(() => {
        Object.assign(prefs, credentials);
        status.stop();
        process.exit(0);
      }).catch((e) =>{
        status.stop();
        throw e;
      });
    })
    .catch(processError);
  });

program
  .command('list-models')
  .option('-u, --username [username]', 'Speech to text username')
  .option('-p, --password [password]', 'Speech to text password')
  .description('List all the models')
  .action((cmd) => {
    const status = new spinner('Getting all the models, please wait...');
    status.start();
    return getCommands(cmd)
    .listModels()
    .then((models) => {
      status.stop();
      console.log(JSON.stringify(models, null, 2).green);
    })
    .catch((e) =>{
      status.stop();
      processError(e);
    });
  });


program
  .command('delete-model')
  .description('Delete a model')
  .option('-u, --username [username]', 'Speech to text username')
  .option('-p, --password [password]', 'Speech to text password')
  .option('-i, --model-id <model_id>', 'The model identifier')
  .action((cmd) => {
    const status = new spinner(`Deleting the custom model ${cmd.model_id}, please wait...`);
    status.start();
    return getCommands(cmd)
    .deleteModel()
    .then(() => {
      status.stop();
    })
    .catch((e) =>{
      status.stop();
      processError(e);
    });
  });

program
  .command('model-status')
  .description('Get model status')
  .option('-u, --username [username]', 'Speech to text username')
  .option('-p, --password [password]', 'Speech to text password')
  .option('-i, --model-id <model_id>', 'The model identifier')
  .action((cmd) => {
    return getCommands(cmd)
    .getModel(cmd)
    .then((model) => {
      console.log(JSON.stringify(model, null, 2).green);
    })
    .catch(processError);
  });

program
  .command('list-model-words')
  .description('List model words all out-of-vocabulary(OOV) words')
  .option('-u, --username [username]', 'Speech to text username')
  .option('-p, --password [password]', 'Speech to text password')
  .option('-i, --model-id <model_id>', 'The model identifier')
  .option('-t, --word-type <word_type>', 'The type of words to be listed from the custom language model\'s words', /^(all|user|corpora)$/i, 'user')
  .action((cmd) => {
    const status = new spinner(`Getting model: ${cmd.model_id} ${cmd.word_type} words, please wait...`);
    status.start();
    return getCommands(cmd)
    .listModelWordss(cmd)
    .then((words) => {
      status.stop();
      console.log(JSON.stringify(words, null, 2).green);
    })
    .catch((e) =>{
      status.stop();
      processError(e);
    });
  });


// Match all the other commands and display the default help
program.command('*', '', { noHelp: true })
  .action(() => program.outputHelp());

// if no arguments, display default help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
