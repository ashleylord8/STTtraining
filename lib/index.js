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


function printWord(w) {
  console.log(`${w.word}\t${w.display_as}\t${w.sounds_like.join(',')}`.green);
}

function printCustomization(m) {
  console.log(`${m.customization_id}\t${m.name}\t${m.base_model_name}\t${m.status}`.green);
}

function printModel(m) {
  console.log(`${m.name}\t${m.rate}\t${m.description}`.green);
}

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
  .command('list-base-models')
  .option('-u, --username [username]', 'Speech to text username')
  .option('-p, --password [password]', 'Speech to text password')
  .description('List all the base models')
  .action((cmd) => getCommands(cmd)
    .listModels()
    .then((models) => models.models.map(printModel))
    .catch(processError)
  );

program
.command('create-customization')
.option('-u, --username [username]', 'Speech to text username')
.option('-p, --password [password]', 'Speech to text password')
.option('-w, --workspace <workspace>', 'The Conversation JSON file (workspace.json) that is to be parsed')
.option('-x, --examples [workspace]', 'The text file where intent examples/entities extracted from JSON file are to be written.')
.option('-n, --name [workspace]', 'The name of the new customization')
.option('-d, --description [workspace]', 'The description of the new customization')
.option('-b, --base-model-name [workspace]', 'The base model name. Default: en-US_BroadbandModel')
.description('Create a custom customization and train it')
.action((cmd) => getCommands(cmd)
  .createCustomization(cmd)
  .then(printCustomization)
  .catch(processError)
);

program
  .command('list-customizations')
  .option('-u, --username [username]', 'Speech to text username')
  .option('-p, --password [password]', 'Speech to text password')
  .description('List all the customization')
  .action((cmd) => getCommands(cmd)
    .listCustomizations()
    .then((customizations) => customizations.customizations.map(printCustomization))
    .catch(processError)
  );

program
  .command('delete-customization')
  .description('Delete a customization')
  .option('-u, --username [username]', 'Speech to text username')
  .option('-p, --password [password]', 'Speech to text password')
  .option('-i, --customization-id <customization-id>', 'The customization identifier')
  .action((cmd) => getCommands(cmd)
    .deleteModel()
    .then(() => console.log('Customization deleted'))
    .catch(processError)
  );

program
  .command('customization-status')
  .description('Get customization status')
  .option('-u, --username [username]', 'Speech to text username')
  .option('-p, --password [password]', 'Speech to text password')
  .option('-i, --customization-id <customization-id>', 'The customization identifier')
  .action((cmd) => getCommands(cmd)
    .getCustomization(cmd)
    .then(printCustomization)
    .catch(processError)
  );

program
  .command('list-customization-words')
  .description('List all out-of-vocabulary(OOV) words for a customization')
  .option('-u, --username [username]', 'Speech to text username')
  .option('-p, --password [password]', 'Speech to text password')
  .option('-i, --customization-id <customization-id>', 'The customization identifier')
  .option('-t, --word-type <word-type>', 'The type of words to be listed from the custom language customization\'s words', /^(all|user|corpora)$/i, 'user')
  .action((cmd) => getCommands(cmd)
    .listModelWordss(cmd)
    .then((words) => words.words.map(printWord))
    .catch(processError)
  );


// Match all the other commands and display the default help
program.command('*', '', { noHelp: true })
  .action(() => program.outputHelp());

// if no arguments, display default help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
