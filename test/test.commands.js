const exec = require('child_process').exec;
const path = require('path');
// eslint-disable-next-line
const should = require('should');
const pkg = require('../package.json');

const bin = path.join(__dirname, '..', pkg.main);
console.log(bin);
describe('parse()', () => {
  it('should print help when using --help', function(done) {
    exec(bin + ' --help', function (error, stdout) {
      stdout.should.containEql('Usage: index <command> [options]');
      stdout.should.containEql('Commands:');
      done();
    });
  });
});
