#!/usr/bin/env node

var program = require('commander');
var actions = require('./actions.js');

program
    .version('0.0.1')
    .option('-u, --username <username>', 'Your STT username')
    .option('-p, --password <password>', 'Your STT password')

program
    .command('create_and_train')
    .description('Create a custom model and train it')
    .option('-f, --workspace <workspace>', '[REQUIRED] The JSON file (workspace.json) that is to be parsed')
    .option('-e, --examples [workspace]', '[OPTIONAL] The txt file where intent examples/entities extracted from JSON file are to be written.')
    .option('-n, --model_name [workspace]', '[OPTIONAL] The name of your model')
    .option('-d, --model_description [workspace]', '[OPTIONAL] The description of your model')
    .option('-b, --base_model_name [workspace]', '[OPTIONAL] The name of your base model')
    .action(function(cmd) {
        params = {
            'speechToText_username': program.username,
            'speechToText_password': program.password,
            'workspace': cmd.workspace,
            'examples': cmd.examples || './test/resources/examples.txt',
            'name': cmd.model_name || 'My Custom Model',
            'base_model_name': cmd.model_name || 'en-US_BroadbandModel',
            'description': cmd.model_description || 'My first STT custom model'
        };
        actions.create_and_train(params);
      }).on('--help', function() {
          console.log('  Example:\n\n' + '    watson-speech-to-text-utils create_and_train -f workspace.json -u abcd766f-3ab4-4b92-9e32-410415e3abcd  -p abcOWKOYDxyz\n');
      });

program
    .command('list_customizations')
    .description('List all customization models')
    .action(function(cmd) {
        params = {
            'speechToText_username': program.username,
            'speechToText_password': program.password,
        };
        actions.list_customizations(params);
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils list_customizations -u abcd766f-3ab4-4b92-9e32-410415e3abcd  -p abcOWKOYDxyz\n');
    });

program
    .command('delete_customization')
    .description('Delete a custom model')
    .option('-i, --custom_id <custom_id>', '[REQUIRED] The customization id of your STT model')
    .action(function(cmd) {
        params = {
            'speechToText_username': program.username,
            'speechToText_password': program.password,
            'customization_id': cmd.custom_id
        };
        actions.delete_customization(params);
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils delete_customization -i f870766f-3ab4-4b92-9e32-410415e3xyzc -u abcd766f-3ab4-4b92-9e32-410415e3abcd -p abcOWKOYDxyz\n');
    });

program
    .command('corpus_status')
    .description('Get corpus status')
    .option('-i, --custom_id <custom_id>', '[REQUIRED] The customization id of your STT model')
    .action(function(cmd) {
        params = {
            'speechToText_username': program.username,
            'speechToText_password': program.password,
            'customization_id': cmd.custom_id
        };
        actions.corpus_status(params);
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils corpus_status -i f870766f-3ab4-4b92-9e32-410415e3xyzc -u abcd766f-3ab4-4b92-9e32-410415e3abcd  -p abcOWKOYDxyz\n');
    });

program
    .command('model_status')
    .description('Get model status')
    .option('-i, --custom_id <custom_id>', '[REQUIRED] The customization id of your STT model')
    .action(function(cmd) {
        params = {
            'speechToText_username': program.username,
            'speechToText_password': program.password,
            'customization_id': cmd.custom_id
        };
        actions.model_status(params);
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils model_status -i f870766f-3ab4-4b92-9e32-410415e3xyzc -u abcd766f-3ab4-4b92-9e32-410415e3abcd  -p abcOWKOYDxyz\n');
    });

program
    .command('show_oovs')
    .description('Show all out-of-vocabulary (OOV) words')
    .option('-i, --custom_id <custom_id>', '[REQUIRED] The customization id of your STT model')
    .action(function(cmd) {
        params = {
            'speechToText_username': program.username,
            'speechToText_password': program.password,
            'customization_id': cmd.custom_id
        };
        actions.show_oovs(params);
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils show_oovs -i f870766f-3ab4-4b92-9e32-410415e3xyzc -u abcd766f-3ab4-4b92-9e32-410415e3abcd  -p abcOWKOYDxyz\n');
    });

program
    .command('add_words')
    .description('Add words to the corpus')
    .option('-i, --custom_id <custom_id>', '[REQUIRED] The customization id of your STT model')
    .option('-c, --corpus_file <corpus_file>', '[REQUIRED] The JSON file consisting of all the words that are to be added')
    .action(function(cmd) {
        params = {
            'speechToText_username': program.username,
            'speechToText_password': program.password,
            'customization_id': cmd.custom_id,
            'words': cmd.corpus_file
        };
        actions.add_words(params);
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils add_words -i f870766f-3ab4-4b92-9e32-410415e3xyzc -c /path/corpus_file.json -u abcd766f-3ab4-4b92-9e32-410415e3abcd  -p abcOWKOYDxyz\n');
    });


program
    .command('add_word')
    .description('Add a single word to the corpus')
    .option('-i, --custom_id <custom_id>', '[REQUIRED] The customization id of your STT model')
    .option('-w, --word <word>', '[REQUIRED] The word to be added')
    .option('-s, --sounds_like [sounds_like]', '[OPTIONAL] The pronunciation of the word')
    .option('-d, --displays_as [displays_as]', '[OPTIONAL] Word is to be displayed as')
    .action(function(cmd) {
        params = {
            'speechToText_username': program.username,
            'speechToText_password': program.password,
            'customization_id': cmd.custom_id,
            'word': cmd.word,
            'sounds_like': cmd.sounds_like.split(/\s*,\s*/) || '',
            'displays_as': cmd.displays_as || ''
        };
        actions.add_word(params);
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils add_word -i f870766f-3ab4-4b92-9e32-410415e3xyzc -w \'TCP\' -s \'T. C. P. , T. See P.\' -d \'TCP\' -u abcd766f-3ab4-4b92-9e32-410415e3abcd -p abcOWKOYDxyz\n');
    });

program.parse(process.argv);
