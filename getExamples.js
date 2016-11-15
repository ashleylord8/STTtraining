// script to create examples.txt for training from the conversation workspace.

var fs = require('fs');
var path_intents = './intent_examples.txt';
var path_entities = './entity_examples.txt';
fs.readFile('./workspace.json', function (err, data) {
  if (err) {
      return console.error(err);
  }
  workspace =  JSON.parse(data.toString());
  var intents = {};
  var examples = "";
  var fd = fs.openSync(path_intents, 'w');
  writeIntentsToFile(fd);
  fd = fs.openSync(path_entities, 'w');
  writeEntitiesToFile(fd);
});

var writeIntentsToFile = function(fd) {
  var sep = "";
  fs.writeSync(fd, '[');
  workspace.intents.forEach(function(item) {
    fs.writeSync(fd, sep + JSON.stringify(item, null,' '));
    if (!sep)
      sep = ', \n';
  });
  fs.writeSync(fd, ']');
  fs.closeSync(fd);
}

var writeEntitiesToFile = function(fd) {
  var sep = "";
  fs.writeSync(fd, '[');
  workspace.entities.forEach(function(item) {
    fs.writeSync(fd, sep + JSON.stringify(item, null,' '));
    if (!sep)
      sep = ', \n';
  });
  fs.writeSync(fd, ']');
  fs.closeSync(fd);
}

// To read examples
// fs.readFile(path_intents, function (err, data) {
//   console.log(JSON.parse(data));
// });
//
// fs.readFile(path_entities, function (err, data) {
//   console.log(JSON.parse(data));
// });
