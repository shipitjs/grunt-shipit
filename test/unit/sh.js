var childProcess = require('child_process');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
var sh = require('../../lib/sh');
var events = require('events');

chai.use(sinonChai);

describe('Shell', function () {
  describe('#spawn', function () {
    beforeEach(function () {
      sinon.stub(childProcess, 'spawn');
    });

    afterEach(function () {
      childProcess.spawn.restore();
    });

    it('should spawn a new child process', function () {
      sh.spawn('ls');
      expect(childProcess.spawn).to.be.calledWith('ls');
    });

    it('should spawn a new child process with args', function () {
      sh.spawn('ls', ['-lah']);
      expect(childProcess.spawn).to.be.calledWith('ls', ['-lah']);
    });
  });

  describe('#run', function () {
    var childProcessObj;

    beforeEach(function () {
      childProcessObj = new events.EventEmitter();
      childProcessObj.stderr = new events.EventEmitter();
      childProcessObj.stdout = new events.EventEmitter();
      sinon.stub(sh, 'spawn').returns(childProcessObj);
    });

    afterEach(function () {
      sh.spawn.restore();
    });

    it('should not return an error if the code is 0', function (done) {
      sh.run('my-command', function (err, stdout) {
        if (err) return done(err);
        expect(stdout).to.equal('command stdout');
        done();
      });

      expect(sh.spawn).to.be.calledWith('my-command');

      childProcessObj.stdout.emit('data', 'command ');
      childProcessObj.stdout.emit('data', 'stdout');
      childProcessObj.emit('close', 0);
    });

    it('should return an error if the code is not 0', function (done) {
      sh.run('my-command', function (err) {
        expect(err.message).to.equal('Error (exit code 2) running command my-command locally.');
        expect(err.code).to.equal(2);
        done();
      });

      expect(sh.spawn).to.be.calledWith('my-command');

      childProcessObj.emit('close', 2);
    });
  });
});