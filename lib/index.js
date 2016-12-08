var Promise = require('bluebird');
var yargs = require('yargs').argv;
var myUtils = require('./utils');
var getExamples = Promise.promisify(myUtils.getExamples);
var createCustomModel = Promise.promisify(myUtils.createCustomModel);
var addCorpusFile = Promise.promisify(myUtils.addCorpusFile);
var getCorpusStatus = Promise.promisify(myUtils.getCorpusStatus);
var waitForCorpusStatus = Promise.promisify(myUtils.waitForCorpusStatus);
var showAllOOVs = Promise.promisify(myUtils.showAllOOVs);
var getModelStatus = Promise.promisify(myUtils.getModelStatus);
var waitForModelStatus = Promise.promisify(myUtils.waitForModelStatus);
var setupTrainingModel = Promise.promisify(myUtils.setupTrainingModel);
var listAllCustomizations = Promise.promisify(myUtils.listAllCustomizations);
var deleteCustomModel = Promise.promisify(myUtils.deleteCustomModel);
var addSingleWord = Promise.promisify(myUtils.addSingleWord);
var addMultipleWords = Promise.promisify(myUtils.addMultipleWords);
var getWords = Promise.promisify(myUtils.getWords);

//Create and Train a custom Model
function createAndTrainCustomModel() {
  // Populate examples.txt with appropriate training phrases
  getExamples().then(function() {
    // Step 1: Create a custom model
    return createCustomModel();
  }).then(function(customID) {
    // Step 2: Add a corpus file
    return addCorpusFile(customID);
  }).then(function(customID) {
    // Step 3: Get status of corpus file just added
    console.log('Checking status of corpus analysis...');
    return getCorpusStatus(customID);
  }).then(function(retObj) {
    if (retObj.status != 'analyzed') { // Wait until corpus status is not 'analyzed'
      return waitForCorpusStatus(retObj.customID);
    } else {
      console.log('Corpus analysis done!');
      return retObj;
    }
  }).then(function(retObj) {
    // Show all OOVs found once corpus is 'analyzed'
    return showAllOOVs(retObj.customID);
  }).then(function(customID) {
    // Get status of model - only continue to training if 'ready'
    console.log('Checking status of the model...');
    return getModelStatus(customID);
  }).then(function(retObj) {
    if (retObj.status != 'ready') {
      // Wait until model status is 'ready'
      return waitForModelStatus(retObj.customID);
    } else {
      console.log('status: ', retObj.status);
      console.log('Model is ready to be trained!');
      return retObj;
    }
  }).then(function(retObj) {
    // Show all OOVs found once model status is 'ready'
    return showAllOOVs(retObj.customID);
  }).then(function(customID) {
    // Step 4: Start training the model
    return setupTrainingModel(customID);
  }).then(function(customID) {
    // Get status of training model
    console.log('Checking status of the model...');
    return getModelStatus(customID);
  }).then(function(retObj) {
    if (retObj.status != 'available') {
      // Wait until the status is 'available'
      return waitForModelStatus(retObj.customID);
    } else {
      console.log('status: ', retObj.status);
      console.log('Training complete!');
      return retObj;
    }
  }).catch(function(err) {
    console.error(err);
  });
}

//Add a list of words and their pronunciations to the corpus
function addWords(customID, file) {
  getWords(file).then(function(words) {
    return addMultipleWords(customID, words);
  }).then(function(customID) {
    // Get status of model - only continue to training if 'ready'
    return getModelStatus(customID);
  }).then(function(retObj) {
    if (retObj.status != 'ready') {
      // Wait until model status is 'ready'
      return waitForModelStatus(retObj.customID);
    } else {
      console.log('status: ', retObj.status);
      return retObj;
    }
  }).then(function(retObj) {
    // Start training the model
    return setupTrainingModel(retObj.customID);
  }).then(function(customID) {
    // Get status of training model
    return getModelStatus(customID);
  }).then(function(retObj) {
    if (retObj.status != 'available') {
      // Wait until the status is 'available'
      return waitForModelStatus(retObj.customID);
    } else {
      console.log('status: ', retObj.status);
      console.log('Training complete!');
      return retObj;
    }
  }).catch(function(err) {
    console.error(err);
  });
}

//Add a single word to the corpus
function addWord(customID, word) {
  var data = {};
  var soundsLikeArray = [];
  if (yargs.soundsLike) {
    var pattern = /\s*,\s*/;
    soundsLikeArray = yargs.soundsLike.split(pattern);
    data['sounds_like'] = soundsLikeArray;
  }
  if (yargs.displaysAs) {
    data['displays_as'] = yargs.displaysAs;
  }

  addSingleWord(customID, word, data).then(function(customID) {
    // Start training the model
    return setupTrainingModel(customID);
  }).then(function(customID) {
    // Get status of training model
    return getModelStatus(customID);
  }).then(function(retObj) {
    if (retObj.status != 'available') {
      // Wait until the status is 'available'
      return waitForModelStatus(retObj.customID);
    } else {
      console.log('status: ', retObj.status);
      console.log('Training complete!');
      return retObj;
    }
  }).catch(function(err) {
    console.error(err);
  });
}

//List all customization models
function listCustomizations() {
  // List all customization models
  listAllCustomizations().catch(function(err) {
    console.error(err);
  });
}

// Delete a custom model
function deleteModel(customID) {
  // Delete a custom model
  deleteCustomModel(customID).catch(function(err) {
    console.error(err);
  });
}

//Get the corpus status
function corpusStatus(customID) {
  console.log('Checking status of corpus analysis...');
  getCorpusStatus(customID).then(function(retObj) {
    console.log('Model status: ', retObj.status);
    if (retObj.status == 'analyzed') {
      console.log('Corpus analysis done!');
    }
    return retObj;
  }).catch(function(err) {
    console.error(err);
  });
}

//Get the model status
function modelStatus(customID) {
  console.log('Checking status of model...');
  getModelStatus(customID).then(function(retObj) {
    console.log('Model status: ', retObj.status);
    if (retObj.status == 'ready') {
      console.log('Model is ready to be trained !');
    } else if (retObj.status == 'available') {
      console.log('Model has been trained !');
    }
    return retObj;
  }).catch(function(err) {
    console.error(err);
  });
}

//Show all OOVs
function showOOVS(customID) {
  // Show all OOVs
  showAllOOVs(customID).catch(function(err) {
    console.error(err);
  });
}

if (yargs.action == 'create_and_train') {
  createAndTrainCustomModel();
} else if (yargs.action == 'list') {
  listCustomizations();
} else if (yargs.id && yargs.action == 'delete') {
  deleteModel(yargs.id);
} else if (yargs.id && yargs.action == 'corpus_status') {
  corpusStatus(yargs.id);
} else if (yargs.id && yargs.action == 'model_status') {
  modelStatus(yargs.id);
} else if (yargs.id && yargs.action == 'OOVs') {
  showOOVS(yargs.id);
} else if (yargs.id && yargs.action == 'add_words' && yargs.file) {
  var file = yargs.file;
  addWords(yargs.id, file);
} else if (yargs.id && yargs.action == 'add_word' && yargs.word) {
  var word = yargs.word;
  addWord(yargs.id, word);
} else {
  console.error('ERROR - Make sure you have the appropriate command line arguments!');
}
