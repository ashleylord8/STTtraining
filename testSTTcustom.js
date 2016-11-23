var param1 = process.argv[2];
var param2 = process.argv[3];
var Promise = require('bluebird');
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
var getTrainingStatus = Promise.promisify(myUtils.getTrainingStatus);
var waitForTrainingStatus = Promise.promisify(myUtils.waitForTrainingStatus);
var listAllCustomizations = Promise.promisify(myUtils.listAllCustomizations);
var deleteCustomModel = Promise.promisify(myUtils.deleteCustomModel);


if (process.argv.length == 3 && param1 == 'train') {
    //Populate examples.txt with appropriate training phrases
    getExamples().then(function() {
            //Step 1: Create a custom model
            return createCustomModel();
        })
        .then(function(customID) {
            //Step 2: Add a corpus file 
            return addCorpusFile(customID);
        })
        .then(function(customID) {
            console.log('Checking status of corpus analysis...');
            //Step 3: Get status of corpus file just added
            return getCorpusStatus(customID);
        })
        .then(function(retObj) {
            if (retObj.status != 'analyzed') { //Wait until corpus status is not 'analyzed'
                return waitForCorpusStatus(retObj.customID);
            } else {
                console.log('Corpus analysis done!');
                return retObj;
            }
        })
        .then(function(retObj) {
            //Show all OOVs found once corpus is 'analyzed'
            return showAllOOVs(retObj.customID);
        })
        .then(function(customID) {
            //Get status of model - only continue to training if 'ready'
            return getModelStatus(customID);
        })
        .then(function(retObj) {
            if (retObj.status != 'ready')
            //Wait until model status is 'ready'
                return waitForModelStatus(retObj.customID);
            else {
                console.log('status: ', retObj.status);
                return retObj;
            }
        })
        .then(function(retObj) {
            //Show all OOVs found once model status is 'ready'
            return showAllOOVs(retObj.customID);
        })
        .then(function(customID) {
            //Step 4: Start training the model
            return setupTrainingModel(customID);
        })
        .then(function(customID) {
            //Get status of training model
            return getTrainingStatus(customID);
        })
        .then(function(retObj) {
            if (retObj.status != 'available') {
                //Wait until the status is 'available'
                return waitForTrainingStatus(retObj.customID);
            } else {
                console.log('status: ', retObj.status);
                console.log('Training complete!');
                return retObj;
            }
        })
        .catch(function(err) {
            console.log(err);
        })
        .done(function(response) {});
} else if (process.argv.length == 3 && param1 == 'list') {
    //List all customization models
    listAllCustomizations()
        .catch(function(err) {
            console.log(err);
        })
        .done(function(response) {});
} else if (process.argv.length == 4 && param1 == 'delete' && param2) {
    var customID = param2;
    //Delete a custom model
    deleteCustomModel(customID)
        .catch(function(err) {
            console.log(err);
        })
        .done(function(response) {});

}