var request = require('request');
var fs = require('fs');
var utf8 = require('utf8');
var path = './examples.txt';
var workspace = {};
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

var speech_to_text = new SpeechToTextV1({
    username: 'f870766f-3ab4-4b92-9e32-410415e36a01',
    password: 'q73OWKOYDsLd'
});

// Get all the intent examples and entities that are to be trained
var getExamples = function(callback) {
    fs.readFile('./workspace.json', function(err, data) {
        if (err) {
            return console.error(err);
        }
        workspace = JSON.parse(data.toString());
        var fd = fs.openSync(path, 'w');
        writeIntentsToFile(fd, workspace);
        writeEntitiesToFile(fd, workspace);
        fs.closeSync(fd);
        callback(null);
    });
}

// Write intent examples to a file
var writeIntentsToFile = function(fd, workspace) {
    var sep = "";
    workspace.intents.forEach(function(item) {
        item.examples.forEach(function(item) {
            item.text = item.text.replace(/ i /g, " I ");
            fs.writeSync(fd, sep + item.text);
            if (!sep)
                sep = '\n';
        });
    });
}

// Write entities to a file
var writeEntitiesToFile = function(fd, workspace) {
    var sep = "\n";
    workspace.entities.forEach(function(item) {
        item.values.forEach(function(item) {
            item.value = item.value.replace(/ i /g, " I ");
            fs.writeSync(fd, sep + item.value);
        });
    });
}


// Change "name" and "description" to suit your own model
var params = {
    "name": "Custom model from doc",
    "base_model_name": "en-US_BroadbandModel",
    "description": "My first STT custom model"
}

// Add Bluemix credentials here
// See following instructions for getting your own credentials:
// http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/getting_started/gs-credentials.shtml#getCreds
var username = 'f870766f-3ab4-4b92-9e32-410415e36a01';
var password = 'q73OWKOYDsLd';

// Create the custom model
var createCustomModel = function(callback) {
    speech_to_text.createCustomization(params, function(err, res, body) {
        console.log('Model creation returns: ' + body.statusCode);
        if (err) {
            console.error("Failed to create model");
            callback(err, null);
        } else {
            var customID = res.customization_id
            console.log('Model customization_id: ', customID);
            callback(null, customID);
        }
    });
}


// Step 2: Add a corpus file (plain text file - ideally one sentence per line,
// but not necessary). In this example, we name it 'corpus1' - you can name
// it whatever you want (no spaces) - if adding more than one corpus, add
// them with different names
var addCorpusFile = function(customID, callback) {
    fs.readFile('examples.txt', function(error, data) {
        if (error) {
            callback(error, null);
        } else {
            var params = {
                "customization_id": customID,
                "name": "corpus3",
                "corpus": data
            };
            speech_to_text.addCorpus(params, function(err, res, body) {
                console.log('Adding corpus file returns: ' + body.statusCode);
                if (err) {
                    console.error("Failed to add corpus");
                    callback(err, null);
                } else {
                    callback(null, customID);
                }
            });
        }

    });
}

// Step 3: Get status of corpus file just added
// After corpus is uploaded, there is some analysis done to extract OOVs.
// One cannot upload a new corpus or words while this analysis is on-going.
var getCorpusStatus = function(customID, callback) {
    var params = {
        "customization_id": customID
    };
    speech_to_text.getCorpora(params, function(err, res, body) {
        if (err) {
            console.error('Failed to get corpus status');
            callback(err, null);
        } else {
            var status;
            var recordsBeingProcessed = res.corpora.filter(function(record) {
                return record['status'] == 'being_processed';
            });
            if (recordsBeingProcessed.length == 0) {
                status = 'analyzed'
            } else {
                status = 'being_processed'
            }

            var retObj = {
                "status": status,
                "customID": customID
            };
            callback(null, retObj);
        }
    });
}

// Wait until corpus status is 'analyzed'
var waitForCorpusStatus = function(customID, callback) {
    var params = {
        "customization_id": customID
    };
    speech_to_text.whenCorporaAnalyzed(params, function(err, res, body) {
        if (err) {
            callback(err, null);
        } else {
            var status = res.corpora[0].status;
            var retObj = {
                "status": status,
                "customID": customID
            };
            console.log('status: ', status);
            console.log('Corpus analysis done!');
            callback(null, retObj);
        }
    });
}

// Show all OOVs found
// This step is only necessary if user wants to look at the OOVs and
// validate the auto-added sounds-like field. Probably a good thing to do though.
var showAllOOVs = function(customID, callback) {
    var params = {
        "customization_id": customID
    };
    speech_to_text.getWords(params, function(err, res, body) {
        if (err) {
            console.error('Failed to show all OOVs');
            callback(err, null);
        } else {
            console.log(JSON.stringify(res.words, null, 2));
            callback(null, customID);
        }
    });
}

// Get status of model - only continue to training if 'ready' or 'available'
var getModelStatus = function(customID, callback) {
    var params = {
        "customization_id": customID
    };
    speech_to_text.getCustomization(params, function(err, res, body) {
        if (err) {
            console.error('Failed to get model status');
            callback(err, null);
        } else {
            var status = res.status;
            var retObj = {
                "status": status,
                "customID": customID
            };
            callback(null, retObj);
        }
    });
}

//Wait until model status is 'ready' or 'available'
var waitForModelStatus = function(customID, callback) {
    var params = {
        "customization_id": customID
    };
    speech_to_text.whenCustomizationReady(params, function(err, res, body) {
        if (err) {
            callback(err, null);
        } else {
            var status = res.status;
            var retObj = {
                "status": status,
                "customID": customID
            };
            console.log('status: ', status);
            if (status == 'ready')
                console.log('Model is ready to be trained!');
            if (status == 'available')
                console.log('Training complete!');
            callback(null, retObj);
        }
    });
}

// Step 4: Start training the model
// After starting this step, need to check its status and wait until the
// status becomes 'available'.
var setupTrainingModel = function(customID, callback) {
    var params = {
        "customization_id": customID,
    };
    speech_to_text.trainCustomization(params, function(err, res, body) {
        if (err) {
            console.error("Training failed to start - exiting!");
            callback(err, null);
        } else {
            console.log('\nTraining request sent, returns: ' + body.statusCode);
            callback(null, customID);
        }
    });
}

// List all customization models for a specific user
var listAllCustomizations = function(callback) {
    var params = {};
    speech_to_text.getCustomizations(params, function(err, res, body) {
        if (err) {
            console.error('Failed to get all customizations');
            callback(err, null);
        } else {
            console.log(JSON.stringify(res, null, 2));
            callback(null);
        }
    });
}

// Delete a specific custom Model
var deleteCustomModel = function(customID, callback) {
    var params = {
        "customization_id": customID
    };
    speech_to_text.deleteCustomization(params, function(err, res, body) {
        if (err) {
            console.error('Failed to delete custom model :' + customID);
            callback(err, null);
        } else {
            console.log('Model deletion returns: ' + body.statusCode);
            callback(null);
        }
    });
}

//Add a single word to the corpus
var addSingleWord = function(customID, word, data, callback) {
    var params = {
        "customization_id": customID,
        "word": word,
        "sounds_like": data.sounds_like,
        "displays_as": data.displays_as
    };
    speech_to_text.addWord(params, function(err, res, body) {
        console.log('Adding single word returns: ' + body.statusCode);
        if (err) {
            console.error("Failed to add a word");
            callback(err, null);
        } else {
            callback(null, customID);
        }
    });
}

//Add multiple words to corpus
var addMultipleWords = function(customID, words, callback) {
    var params = {
        "customization_id": customID,
        "words": words
    };
    speech_to_text.addWords(params, function(err, res, body) {
        console.log('Adding single word returns: ' + body.statusCode);
        if (err) {
            console.error("Failed to add a words");
            callback(err, null);
        } else {
            callback(null, customID);
        }
    });
}

// Get all the intent examples and entities that are to be trained
var getWords = function(fileName, callback) {
    fs.readFile(fileName, function(err, data) {
        if (err) {
            return console.error(err);
        }

        words = JSON.parse(data.toString());
        callback(null, words);
    });
}

module.exports = {
    getExamples: getExamples,
    createCustomModel: createCustomModel,
    addCorpusFile: addCorpusFile,
    getCorpusStatus: getCorpusStatus,
    waitForCorpusStatus: waitForCorpusStatus,
    showAllOOVs: showAllOOVs,
    getModelStatus: getModelStatus,
    waitForModelStatus: waitForModelStatus,
    setupTrainingModel: setupTrainingModel,
    listAllCustomizations: listAllCustomizations,
    deleteCustomModel: deleteCustomModel,
    addSingleWord: addSingleWord,
    addMultipleWords: addMultipleWords,
    getWords: getWords
};
