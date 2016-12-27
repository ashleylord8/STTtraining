#!/usr/bin/env node --harmony
const pkg = require('./package.json');

if (require.main === module) {
  require('./lib/index.js');
} else {
  // setup as Node module
  console.log(`${pkg.name} is a command line utility, not a module include.`);
  console.log('If you\'d like to programmatically integrate the Watson services' +
  ' into your app, use the Watson Node.js SDK https://github.com/watson-developer-cloud/node-sdk/');
}
