var request = require('request');
var fs = require('fs');
var path = './examples.txt';
var workspace = {};

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
var data = {
  "name": "Custom model from doc",
  "base_model_name": "en-US_BroadbandModel",
  "description": "My first STT custom model"
}

// Add Bluemix credentials here
// See following instructions for getting your own credentials:
// http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/getting_started/gs-credentials.shtml#getCreds
var username = '3a4c5c6e-6e5d-465d-ab2d-305e3fa3867a';
var password = 'VVHQSL7naTA2';

// Create the custom model
var createCustomModel = function(callback) {
  request.post({
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
    },
    url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations',
    body: JSON.stringify(data)
  }, function(error, response, body) {
    console.log('Model creation returns: ' + response.statusCode);
    var text = JSON.parse(body);
    if (response.statusCode != 201) {
      console.error("Failed to create model");
      console.error(text.error);
      process.exit(1);
    }
    var customID = text.customization_id;
    console.log('Model customization_id: ', customID);
    callback(null, customID);
  });
}


// Step 2: Add a corpus file (plain text file - ideally one sentence per line,
// but not necessary). In this example, we name it 'corpus1' - you can name
// it whatever you want (no spaces) - if adding more than one corpus, add
// them with different names
var addCorpusFile = function(customID, callback) {
  fs.readFile('examples.txt', function(err, data) {
    if (err) {
      return console.log(err);
    }

    request.post({
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
      },
      url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + customID + '/corpora/corpus1',
      body: data
    }, function(error, response, body) {
      console.log('\nAdding corpus file returns: ' + response.statusCode);
      var text = JSON.parse(body);
      if (response.statusCode != 201) {
          console.log('Failed to add corpus file');
          console.log(text.error);
          process.exit(1);
      }
      callback(null, customID);
    });
  });
}

// Step 3: Get status of corpus file just added
// After corpus is uploaded, there is some analysis done to extract OOVs.
// One cannot upload a new corpus or words while this analysis is on-going.
var getCorpusStatus = function(customID, callback) {
  request.get({
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
    },
    url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + customID + '/corpora'
  }, function(error, response, body) {
    var jsonObj = JSON.parse(body);
    var status = jsonObj.corpora[0].status;
    var retObj = {
        "status": status,
        "customID": customID
    };
    callback(null, retObj);
  });
}

// Wait until corpus status is 'analyzed'
var waitForCorpusStatus = function(customID, callback) {
  var time = 0;
  var intervalObject = setInterval(function() {
    getCorpusStatus(customID, function(err, retObj) {
      var status = retObj.status;
      time = time + 10;
      if (status == 'analyzed') {
        clearInterval(intervalObject);
        console.log('status: ', status, '(', time, ')');
        console.log('Corpus analysis done!');
        var retObj = {
            "status": status,
            "customID": customID
        };
        callback(null, retObj);
      } else {
        console.log('status: ', status, '(', time, ')');
      }
    });
  }, 10000);
}

// Show all OOVs found
// This step is only necessary if user wants to look at the OOVs and
// validate the auto-added sounds-like field. Probably a good thing to do though.
var showAllOOVs = function(customID, callback) {
  request.get({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
    },
    url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + customID + '/words'
  }, function(error, response, body) {
    console.log(body);
    callback(null, customID);
  });
}

// Get status of model - only continue to training if 'ready'
var getModelStatus = function(customID, callback) {
  request.get({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
    },
    url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + customID
  }, function(error, response, body) {
    var jsonObj = JSON.parse(body);
    var status = jsonObj.status;
    var retObj = {
      "status": status,
      "customID": customID
    };
    callback(null, retObj);
  });
}

//Wait until model status is 'ready'
var waitForModelStatus = function(customID, callback) {
  var time = 0;
  var intervalObject = setInterval(function() {
    getModelStatus(customID, function(err, retObj) {
      var status = retObj.status;
      time = time + 10;
      if (status == 'ready') {
        clearInterval(intervalObject);
        console.log('status: ', status, '(', time, ')');
        var retObj = {
          "status": status,
          "customID": customID
        };
        callback(null, retObj);
      } else {
        console.log('status: ', status, '(', time, ')');
      }
    });
  }, 10000);
}

// Step 4: Start training the model
// After starting this step, need to check its status and wait until the
// status becomes 'available'.
var setupTrainingModel = function(customID, callback) {
  var data1 = {};
  request.post({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
    },
    url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + customID + '/train',
    body: JSON.stringify(data1)
  }, function(error, response, body) {
    console.log('\nTraining request sent, returns: ' + response.statusCode);
    var text = JSON.parse(body);
    if (response.statusCode != 200) {
      console.log("Training failed to start - exiting!");
      process.exit(1);
    }
    callback(null, customID);
  });
}

// Get status of training model
var getTrainingStatus = function(customID, callback) {
  request.get({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
    },
    url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + customID
  }, function(error, response, body) {
    var jsonObj = JSON.parse(body);
    var status = jsonObj.status;
    var retObj = {
        "status": status,
        "customID": customID
    };
    callback(null, retObj);
  });
}

// Wait until the status of the training model is 'available'
var waitForTrainingStatus = function(customID, callback) {
  var time = 0;
  var intervalObject = setInterval(function() {
    getModelStatus(customID, function(err, retObj) {
      var status = retObj.status;
      time = time + 10;
      if (status == 'available') {
        clearInterval(intervalObject);
        console.log('status: ', status, '(', time, ')');
        console.log('Training complete!');
        var retObj = {
          "status": status,
          "customID": customID
        };
        callback(null, retObj);
      } else {
        console.log('status: ', status, '(', time, ')');
      }
    });
  }, 10000);
}

// List all customization models for a specific user
var listAllCustomizations = function(callback) {
  request.get({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
    },
    url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/'
  }, function(error, response, body) {
    console.log('\nGet models returns:');
    console.log(body);
    callback(null);
  });
}

// Delete a specific custom Model
var deleteCustomModel = function(customID, callback) {
  request.delete({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
    },
    url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + customID
  }, function(error, response, body) {
    console.log('\nModel deletion returns:' + response.statusCode);
    callback();
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
  getTrainingStatus: getTrainingStatus,
  waitForTrainingStatus: waitForTrainingStatus,
  listAllCustomizations: listAllCustomizations,
  deleteCustomModel: deleteCustomModel,
};
