const exec = require('child_process').exec;
const path = require('path');
// eslint-disable-next-line
const should = require('should');
const pkg = require('../package.json');

const bin = path.join(__dirname, '..', pkg.main);
describe('CLI()', () => {
  it('should print warning if used as node module', function(done) {
    (function(){
      const oldLog = console.log;
      console.log = function (message) {
        message.should.containEql('is a command line utility, not a module include');
        console.log = oldLog;
        done();
      };
      require('../index');
    })();
  });
  it('should print help when using --help', function(done) {
    exec(bin + ' --help', function (error, stdout) {
      stdout.should.containEql('Usage: index <command> [options]');
      stdout.should.containEql('Commands:');
      done();
    });
  });
  it('should print help when using -h', function(done) {
    exec(bin + ' -h', function (error, stdout) {
      stdout.should.containEql('Usage: index <command> [options]');
      stdout.should.containEql('Commands:');
      done();
    });
  });
  it('should print usage if the action does not exist', function(done) {
    exec(bin + ' foo', function (error, stdout) {
      stdout.should.containEql('Usage: index <command> [options]');
      stdout.should.containEql('Commands:');
      done();
    });
  });
  it('should print help when using an action and --help', function(done) {
    exec(bin + ' base-models-list --help', function (error, stdout) {
      stdout.should.containEql('Usage: base-models-list [options]');
      stdout.should.containEql('Options:');
      done();
    });
  });
  it('should print version when using -V', function(done) {
    exec(bin + ' -V', function (error, stdout) {
      stdout.should.containEql(pkg.version);
      done();
    });
  });
  it('should print version when using --version', function(done) {
    exec(bin + ' --version', function (error, stdout) {
      stdout.should.containEql(pkg.version);
      done();
    });
  });
});
