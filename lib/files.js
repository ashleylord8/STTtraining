var fs = require('fs');
var path = require('path');

module.exports = {
  getCurrentDirectoryBase : () => path.basename(process.cwd()),
  fileExists: (fileName) => fileName && fs.existsSync(fileName),
};
