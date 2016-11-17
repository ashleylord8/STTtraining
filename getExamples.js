// script to create examples.txt for training from the conversation workspace.

var fs = require('fs');
var path = './examples.txt';
var workspace = {};
fs.readFile('./workspace.json', function (err, data) {
  if (err) {
      return console.error(err);
  }
  workspace =  JSON.parse(data.toString());
  var fd = fs.openSync(path, 'w');
  writeIntentsToFile(fd);
  writeEntitiesToFile(fd);
  fs.closeSync(fd);
});

var writeIntentsToFile = function(fd) {
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

var writeEntitiesToFile = function(fd) {
  var sep = "\n";
  workspace.entities.forEach(function(item) {
    item.values.forEach(function(item) {
      item.value = item.value.replace(/ i /g, " I ");
      fs.writeSync(fd, sep + item.value);
    });
  });
}
