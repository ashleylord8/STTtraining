var request = require('request');
var fs = require('fs');

// var speech_to_text = new SpeechToTextV1(function(username, password){
//     username: 'f870766f-3ab4-4b92-9e32-410415e36a01',
//     password: 'q73OWKOYDsLd'
// });
// Get all the intent examples and entities that are to be trained
var getExamples = function(inputFile, outputFile, callback) {
  fs.readFile(inputFile, function(err, data) {
    if (err) {
      return console.error(err);
    }
    workspace = JSON.parse(data.toString());
    var fd = fs.openSync(outputFile, 'w');
    writeIntentsToFile(fd, workspace);
    writeEntitiesToFile(fd, workspace);
    fs.closeSync(fd);
    callback(null);
  });
};

// Write intent examples to a file
var writeIntentsToFile = function(fd, workspace) {
  var sep = '';
  workspace.intents.forEach(function(item) {
    item.examples.forEach(function(item) {
      item.text = item.text.replace(/ i /g, ' I ');
      fs.writeSync(fd, sep + item.text);
      if (!sep){
        sep = '\n';
      }
    });
  });
};

// Write entities to a file
var writeEntitiesToFile = function(fd, workspace) {
  var sep = '\n';
  workspace.entities.forEach(function(item) {
    item.values.forEach(function(item) {
      item.value = item.value.replace(/ i /g, ' I ');
      fs.writeSync(fd, sep + item.value);
    });
  });
};

var create_and_train = function(params, callback) {
  console.log(params);
  //TO DO
}

var list_customizations = function(params, callback) {
  console.log(params);
  //TO DO
}

var delete_customization = function(params, callback) {
  console.log(params);
  //TO DO
}

var corpus_status = function(params, callback) {
  console.log(params);
  //TO DO
}

var model_status = function(params, callback) {
  console.log(params);
  //TO DO
}

var show_oovs = function(params, callback) {
  console.log(params);
  //TO DO
}

var add_words = function(params, callback) {
  console.log(params);
  //TO DO
}

var add_word = function(params, callback) {
  console.log(params);
  //TO DO
}

module.exports = {
  create_and_train: create_and_train,
  list_customizations: list_customizations,
  delete_customization: delete_customization,
  corpus_status: corpus_status,
  model_status: model_status,
  show_oovs: show_oovs,
  add_words: add_words,
  add_word: add_word
};
