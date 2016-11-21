var request = require('request');
var fs = require('fs');
var param1 = process.argv[2];
var param2 = process.argv[3];
var path = './examples.txt';
var workspace = {};

//Function to extract intent examples from JSON
var getExamples = function()
{
fs.readFile('./workspace.json', function (err, data) {
  if (err) {
      return console.error(err);
  }
  workspace =  JSON.parse(data.toString());
  var fd = fs.openSync(path, 'w');
  writeIntentsToFile(fd, workspace);
  writeEntitiesToFile(fd, workspace);
  fs.closeSync(fd);
});
}

//Write intent examples to a file
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

//Write entities to a file
var writeEntitiesToFile = function(fd, workspace) {
  var sep = "\n";
  workspace.entities.forEach(function(item) {
    item.values.forEach(function(item) {
      item.value = item.value.replace(/ i /g, " I ");
      fs.writeSync(fd, sep + item.value);
    });
  });
}



// # Step 1: Create a custom model
// # Change "name" and "description" to suit your own model
var data = {
      "name": "Custom model from doc",
      "base_model_name": "en-US_BroadbandModel",
      "description": "My first STT custom model"
}


// # Add Bluemix credentials here
// # See following instructions for getting your own credentials:
// # http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/getting_started/gs-credentials.shtml#getCreds
var username = 'f870766f-3ab4-4b92-9e32-410415e36a01';
var password = 'q73OWKOYDsLd';


// # Create the custom model
function createCustomModel(callback) {
    request.post({
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
        },
        url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations',
        body: JSON.stringify(data)
    }, function(error, response, body) {
        console.log(response.statusCode);
        var text = JSON.parse(body);
        if (response.statusCode != 201) {
            console.log("Failed to create model");
            console.log(text.error);
            process.exit(1);
        }
        var customID = text.customization_id;
        console.log('Model customization_id: ', customID);
        callback(customID);
    });
}


// # Step 2: Add a corpus file (plain text file - ideally one sentence per line,
// # but not necessary). In this example, we name it 'corpus1' - you can name
// # it whatever you want (no spaces) - if adding more than one corpus, add
// # them with different names
function addCorpusFile(customID, callback) {
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
            console.log('Adding corpus file returns: '+ response.statusCode);
            var text = JSON.parse(body);
            if (response.statusCode != 201) {
              console.log('Failed to add corpus file');
              console.log(text.error);
              process.exit(1);
            }
            callback(customID);
        });
    });

}

// # Step 3: Get status of corpus file just added
// # After corpus is uploaded, there is some analysis done to extract OOVs.
// # One cannot upload a new corpus or words while this analysis is on-going.
function getCorpusStatus(customID, callback){
        request.get({
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
            },
            url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + customID + '/corpora'
        }, function(error, response, body) {
            var jsonObj = JSON.parse(body);
            var status = jsonObj.corpora[0]['status'];
            callback(status);
        });  
}

//Wait until corpus status is 'analyzed'
function waitForCorpusStatus(customID, callback) {
    var time = 0;
    var intervalObject = setInterval(function() {
        getCorpusStatus(customID, function(status) {
            time = time + 10;
            if (status == 'analyzed') {
                clearInterval(intervalObject);
                console.log('status: ', status, '(', time, ')');
                console.log('Corpus analysis done!');
                callback(status);

            } else {
                console.log('status: ', status, '(', time, ')');

            }

        });

    }, 10000);
}

// # Show all OOVs found
// # This step is only necessary if user wants to look at the OOVs and
// # validate the auto-added sounds-like field. Probably a good thing to do though.
function showAllOOVs(customID, callback){
  request.get({
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
            },
            url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/'+customID+'/words'
        }, function(error, response, body) {
           console.log(body);
           callback(customID);
        });  
}

// # Get status of model - only continue to training if 'ready'
function getModelStatus(customID, callback){
    request.get({
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
            },
            url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/'+customID
        }, function(error, response, body) {
           var jsonObj = JSON.parse(body);
           var status = jsonObj.status;
          callback(status);
        });  
}

//Wait until model status is 'ready'
function waitForModelStatus(customID, callback) {
    var time = 0;
    var intervalObject = setInterval(function() {
        getModelStatus(customID, function(status) {
            time = time + 10;
            if (status == 'ready') {
                clearInterval(intervalObject);
                console.log('status: ', status, '(', time, ')');
                callback(status);

            } else {
                console.log('status: ', status, '(', time, ')');

            }

        });

    }, 10000);
}

// # Step 4: Start training the model
// # After starting this step, need to check its status and wait until the
// # status becomes 'available'.
function setupTrainingModel(customID, callback){
  var data = {};
  request.post({
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
        },
        url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/'+customID+'/train',
        body: JSON.stringify(data)
    }, function(error, response, body) {
        console.log('Training request sent, returns: ' + response.statusCode);
        var text = JSON.parse(body);
        if (response.statusCode != 200) {
            console.log("Training failed to start - exiting!");
            process.exit(1);
        }
        callback(customID);
    });
}

//Get status of training model
function getTrainingStatus(customID, callback){
    request.get({
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
            },
            url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/'+customID
        }, function(error, response, body) {
           var jsonObj = JSON.parse(body);
           var status = jsonObj.status;
          callback(status);
        });
}

//Wait until the status of the training model is 'available'
function waitForTrainingStatus(customID, callback) {
    var time = 0;
    var intervalObject = setInterval(function() {
        getModelStatus(customID, function(status) {
            time = time + 10;
            if (status == 'available') {
                clearInterval(intervalObject);
                console.log('status: ', status, '(', time, ')');
                console.log('Training complete!');
                callback(status);

            } else {
                console.log('status: ', status, '(', time, ')');

            }

        });

    }, 10000);
}

//List all customization models for a specific user
function listAllCustomizations(callback){
  request.get({
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
            },
            url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/'
        }, function(error, response, body) {
           console.log('\nGet models returns:');
           console.log(body);
           callback();
        });  
}

//Delete a specific custom Model
function deleteCustomModel(customID, callback){
  request.delete({
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
            },
            url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/'+customID
        }, function(error, response, body) {
           console.log('\nModel deletion returns:' + response.statusCode);
           callback();
        });  
}

//If the command line argument is 'train'
if(process.argv.length == 3 && param1 == 'train')
{
  //Populate examples.txt with appropriate training phrases
  getExamples();
  //Step 1: Create a custom model
  createCustomModel(function(customID) {
      //Step 2: Add a corpus file 
      addCorpusFile(customID, function() {
          console.log('Checking status of corpus analysis...');
          //Step 3: Get status of corpus file just added
          getCorpusStatus(customID, function(status) {
              if (status != 'analyzed') {
                //Wait until corpus status is not 'analyzed'
                waitForCorpusStatus(customID, function(status){
                  //Show all OOVs found once corpus ia 'analyzed'
                  showAllOOVs(customID, function() {
                      //Get status of model - only continue to training if 'ready'
                      getModelStatus(customID, function(status) {
                        //If model status is not 'ready'
                        if (status != 'ready') { 
                          //Wait until model status is 'ready'
                          waitForModelStatus(customID, function(status){
                            //Show all OOVs found
                            showAllOOVs(customID, function() {
                              //Step 4: Start training the model
                              setupTrainingModel(customID, function() {
                                //Get status of training model
                                getTrainingStatus(customID, function(status) {
                                  if (status != 'available') {
                                    //Wait until the status is 'available'
                                    waitForTrainingStatus(customID, function(status){

                                    });
                                  }
                                  else //If training model status 'available'
                                  {
                                    console.log('Training complete!');
                                  }
                                });
                              });
                            });
                          });
                        } 
                        else{ //If model status is 'ready', then no need to wait
                          //Show all OOVs found once corpus is 'ready'
                          showAllOOVs(customID, function() {
                            //Step 4: Start training the model
                            setupTrainingModel(customID, function() {
                                //Get status of training model
                                getTrainingStatus(customID, function(status) {
                                  if (status != 'available') {
                                    //Wait until the status is 'available'
                                    waitForTrainingStatus(customID, function(status){

                                    });
                                  }
                                  else //If training model status 'available'
                                  {
                                    console.log('Training complete!');
                                  }
                                });
                              });
                          });
                        }
                      });
                  }); 
                });

              } 
              else //If corpus status is 'analyzed', then no need to wait
              {           
                  console.log('Corpus analysis done!');
                  //Show all OOVs found once corpus is 'ready'
                  showAllOOVs(customID, function() {
                      //Get status of model - only continue to training if 'ready'
                      getModelStatus(customID, function(status) {
                        //If model status is not 'ready'
                        if (status != 'ready') {
                          //Wait until model status is 'ready'
                          waitForModelStatus(customID);
                          //Show all OOVs found
                          showAllOOVs(customID, function() {
                                //Step 4: Start training the model
                                setupTrainingModel(customID, function() {
                                //Get status of training model
                                getTrainingStatus(customID, function(status) {
                                  if (status != 'available') {
                                    //Wait until the status is 'available'
                                    waitForTrainingStatus(customID, function(status){

                                    });
                                  }
                                  else //If training model status 'available'
                                  {
                                    console.log('Training complete!');
                                  }
                                });
                              });
                            });
                        } 
                        else{ //If model status is 'ready', then no need to wait
                          //Show all OOVs found once corpus is 'ready
                          showAllOOVs(customID, function() {
                                //Step 4: Start training the model
                                setupTrainingModel(customID, function() {
                                //Get status of training model
                                getTrainingStatus(customID, function(status) {
                                  if (status != 'available') {
                                    //Wait until the status is 'available'
                                    waitForTrainingStatus(customID, function(status){

                                    });
                                  }
                                  else //If training model status 'available'
                                  {
                                    console.log('Training complete!');
                                  }
                                });
                              });
                          });
                        }
                      });
                  }); 
              }

          });

      });

  });

}
//If the command line argument is 'list'
else if(process.argv.length == 3 && param1 == 'list')
{
  //List all customization models
  listAllCustomizations(function(){
  });
}
////If the command line argument is 'delete'
else if(process.argv.length == 4 && param1 == 'delete')
{
  var customID = param2;
  //Delete a custom model
  deleteCustomModel(customID, function(){

  });
}


