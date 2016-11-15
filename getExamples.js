// script to create examples.txt for training from the conversation workspace.

var fs = require('fs');
var path_intents = './intent_examples.txt';
var path_entities = './entity_examples.txt';
var workspace = {};
fs.readFile('./workspace.json', function (err, data) {
  if (err) {
      return console.error(err);
  }
  workspace =  JSON.parse(data.toString());
  var fd = fs.openSync(path_intents, 'w');
  writeIntentsToFile(fd);
  fd = fs.openSync(path_entities, 'w');
  writeEntitiesToFile(fd);
});

var writeIntentsToFile = function(fd) {
  var sep = "";
  workspace.intents.forEach(function(item) {
    item.examples.forEach(function(item) {
      fs.writeSync(fd, sep + item.text);
      if (!sep)
        sep = '\n';
    });
  });
  fs.closeSync(fd);
}

var writeEntitiesToFile = function(fd) {
  var sep = "";
  workspace.entities.forEach(function(item) {
    item.values.forEach(function(item) {
      fs.writeSync(fd, sep + item.value);
      if (!sep)
        sep = '\n';
    });
  });
  fs.closeSync(fd);
}
