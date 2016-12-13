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
    .option('-f, --workspace [workspace]', '[REQUIRED] The JSON file (workspace.json) that is to be parsed')
    .option('-e, --examples [examples]', '[OPTIONAL] The txt file where intent examples/entities extracted from JSON file are to be written.')
    .option('-n, --model_name [model_name]', '[OPTIONAL] The name of your model')
    .option('-d, --description [description]', '[OPTIONAL] The description of your model')
    .option('-b, --base_model_name [base_model_name]', '[OPTIONAL] The name of your base model')
    .action(function(cmd) {
        cmdValue = cmd._name;
        workspace = cmd.workspace;
        examples = cmd.examples;
        model_name = cmd.model_name;
        description = cmd.description;
        base_model_name = cmd.base_model_name;
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils create_and_train -f workspace.json -u username -p password\n');
    });

program
    .command('list_customizations')
    .description('List all customization models')
    .action(function(cmd, options) {
        cmdValue = cmd._name;
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils list_customization -u username -p password\n');
    });

program
    .command('delete_customization')
    .description('Delete a custom model')
    .option('-i, --custom_id [custom_id]', '[REQUIRED] The customization id of your STT model')
    .action(function(cmd) {
        cmdValue = cmd._name;
        custom_id = cmd.custom_id;
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils delete_customization -i custom_id -u username -p password\n');
    });

program
    .command('corpus_status')
    .description('Get corpus status')
    .option('-i, --custom_id [custom_id]', '[REQUIRED] The customization id of your STT model')
    .action(function(cmd) {
        cmdValue = cmd._name;
        custom_id = cmd.custom_id;
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils corpus_status -i custom_id -u username -p password\n');
    });

program
    .command('model_status')
    .description('Get model status')
    .option('-i, --custom_id [custom_id]', '[REQUIRED] The customization id of your STT model')
    .action(function(cmd) {
        cmdValue = cmd._name;
        custom_id = cmd.custom_id;
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils model_status -i custom_id -u username -p password\n');
    });

program
    .command('show_oovs')
    .description('Show all out-of-vocabulary (OOV) words')
    .option('-i, --custom_id [custom_id]', '[REQUIRED] The customization id of your STT model')
    .action(function(cmd) {
        cmdValue = cmd._name;
        custom_id = cmd.custom_id;
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils show_oovs -i custom_id -u username -p password\n');
    });

program
    .command('add_words')
    .description('Add words to the corpus')
    .option('-i, --custom_id [custom_id]', '[REQUIRED] The customization id of your STT model')
    .option('-c, --corpus_file [corpus_file]', '[REQUIRED] The JSON file consisting of all the words that are to be added')
    .action(function(cmd) {
        cmdValue = cmd._name;
        custom_id = cmd.custom_id;
        corpus_file = cmd.corpus_file;
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils add_words -i custom_id -c corpus_file.json -u username -p password\n');
    });


program
    .command('add_word')
    .description('Add a single word to the corpus')
    .option('-i, --custom_id [custom_id]', '[REQUIRED] The customization id of your STT model')
    .option('-w, --word [word]', '[REQUIRED] The word to be added')
    .option('-s, --sounds_like [sounds_like]', '[OPTIONAL] The pronunciation of the word')
    .option('-d, --displays_as [displays_as]', '[OPTIONAL] Word is to be displayed as')
    .action(function(cmd) {
        cmdValue = cmd._name;
        custom_id = cmd.custom_id;
        word = cmd.word;
        sounds_like = cmd.sounds_like;
        displays_as = cmd.displays_as;
    }).on('--help', function() {
        console.log('  Example:\n\n' + '    watson-speech-to-text-utils add_word -i custom_id -w word -u username -p password\n');
    });

program.parse(process.argv);

if (typeof cmdValue === 'undefined') {
    console.error('ERROR - The command is invalid!');
    process.exit(1);
} else if (!program.username || !program.password) {
    console.error('ERROR - Please enter your credentials');
    process.exit(1);
} else if (cmdValue == 'create_and_train' && workspace) {
    var params = {
        "workspace": workspace,
        "examples": examples || './test/resources/examples.txt',
        "model_name": model_name || 'My Custom Model',
        "base_model_name": base_model_name || 'en-US_BroadbandModel',
        "description": description || 'My first STT custom model'
    };
    actions.create_and_train(params);
} else if (cmdValue == 'list_customizations') {
    var params = {};
    actions.list_customizations(params);
} else if (cmdValue == 'delete_customization' && custom_id) {
    var params = {
        "custom_id": custom_id
    }
    actions.delete_customization(params);
} else if (cmdValue == 'corpus_status' && custom_id) {
    var params = {
        "custom_id": custom_id
    }
    actions.corpus_status(params);
} else if (cmdValue == 'model_status' && custom_id) {
    var params = {
        "custom_id": custom_id
    }
    actions.model_status(params);
} else if (cmdValue == 'show_oovs' && custom_id) {
    var params = {
        "custom_id": custom_id
    }
    actions.show_oovs(params);
} else if (cmdValue == 'add_words' && custom_id && corpus_file) {
    var params = {
        "custom_id": custom_id,
        "corpus_file": corpus_file
    }
    actions.add_words(params);
} else if (cmdValue == 'add_word' && custom_id && word) {
    var params = {
        "custom_id": custom_id,
        "word": word,
        "sounds_like": sounds_like || '',
        "displays_as": displays_as || ''
    }
    actions.add_word(params);
} else {
    console.error('ERROR - Please make sure you have appropriate command line arguments!');
}
