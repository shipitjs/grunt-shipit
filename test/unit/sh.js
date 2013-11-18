var childProcess = require('child_process'),
  sinon = require('sinon'),
  chai = require('chai'),
  expect = chai.expect,
  sinonChai = require('sinon-chai'),
  sh = require('../../lib/sh'),
  events = require('events');

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
      sh.run('my-command', done);

      expect(sh.spawn).to.be.calledWith('my-command');

      childProcessObj.emit('close', 0);
    });

    it('should return an error if the code is not 0', function (done) {
      sh.run('my-command', function (err) {
        expect(err).to.deep.equal(new Error('Error (exit code 2) running command my-command on host'));
        done();
      });

      expect(sh.spawn).to.be.calledWith('my-command');

      childProcessObj.emit('close', 2);
    });
  });
});