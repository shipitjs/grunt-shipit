var rewire = require('rewire');
var expect = require('chai').use(require('sinon-chai')).expect;
var childProcess = require('../mocks/child-process');
var cmd = rewire('../../lib/command');

describe('Command', function () {
  describe('#spawn', function () {
    beforeEach(function () {
      cmd.__set__('childProcess', childProcess);
    });

    afterEach(function () {
      childProcess.restore();
    });

    it('should not return an error if the code is 0', function (done) {
      cmd.spawn('my-command', ['-x'], { cwd: '/root' }, function (err, stdout) {
        if (err) return done(err);
        expect(stdout).to.equal('command stdout');
        done();
      });

      expect(childProcess.spawn).to.be.calledWith('my-command', ['-x'], { cwd: '/root' });

      childProcess.child.stdout.emit('data', 'command ');
      childProcess.child.stdout.emit('data', 'stdout');
      childProcess.child.emit('close', 0);
    });

    it('should return an error if the code is not 0', function (done) {
      cmd.spawn('my-command', ['-x'], { cwd: '/root' }, function (err) {
        expect(err.message).to.equal('Error (exit code 2) running command "my-command".');
        expect(err.code).to.equal(2);
        done();
      });

      expect(childProcess.spawn).to.be.calledWith('my-command', ['-x'], { cwd: '/root' });

      childProcess.child.stdout.emit('data', 'command ');
      childProcess.child.stdout.emit('data', 'stdout');
      childProcess.child.emit('close', 2);
    });
  });
});