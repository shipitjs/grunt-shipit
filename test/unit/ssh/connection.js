var rewire = require('rewire');
var sinon = require('sinon');
var expect = require('chai').use(require('sinon-chai')).expect;
var childProcess = require('../../mocks/child-process');
var logger = require('../../mocks/logger');
var remote = require('../../../lib/ssh/remote');
var Connection = rewire('../../../lib/ssh/connection');

describe('SSH Connection', function () {
  beforeEach(function () {
    Connection.__set__('childProcess', childProcess);
  });

  afterEach(function () {
    childProcess.restore();
  });

  describe('constructor', function () {
    beforeEach(function () {
      sinon.stub(remote, 'format').returns('user@host');
      sinon.stub(remote, 'parse').returns({ user: 'user', host: 'host' });
    });

    afterEach(function () {
      remote.format.restore();
      remote.parse.restore();
    });

    it('should accept remote object', function () {
      var connection = new Connection({
        remote: { user: 'user', host: 'host' },
        logger: logger
      });
      expect(connection.remote).to.be.deep.equal({ user: 'user', host: 'host' });
    });

    it('should accept remote string', function () {
      var connection = new Connection({
        remote: 'user@host',
        logger: logger
      });
      expect(connection.remote).to.deep.equal({ user: 'user', host: 'host' });
    });
  });

  describe('#run', function () {
    var connection;

    beforeEach(function () {
      connection = new Connection({
        remote: 'user@host',
        logger: logger
      });
    });

    it('should call childProcess.exec', function (done) {
      connection.run('my-command -x', { cwd: '/root' }, done);

      expect(childProcess.exec).to.be.calledWith(
        'ssh -p 22 user@host "my-command -x"',
        { cwd: '/root', maxBuffer: 1000 * 1024 }
      );
    });

    it('should escape double quotes', function (done) {
      connection.run('echo "ok"', {cwd: '/root'}, done);

      expect(childProcess.exec).to.be.calledWith(
        'ssh -p 22 user@host "echo \\"ok\\""',
        { cwd: '/root', maxBuffer: 1000 * 1024 }
      );
    });

    it('should handle childProcess.exec callback correctly', function (done) {
      connection.run('my-command -x', { cwd: '/root' }, function(err, stdout, stderr) {
        if (err) return done(err);
        expect(stdout).to.eql("stdout");
        expect(stderr).to.eql(undefined);
        done();
      });
    });

    it('should handle sudo', function (done) {
      connection.run('sudo my-command -x', { cwd: '/root' }, done);

      expect(childProcess.exec).to.be.calledWith(
        'ssh -tt -p 22 user@host "sudo my-command -x"',
        { cwd: '/root', maxBuffer: 1000 * 1024 }
      );
    });

    it('should copy args', function () {
      connection.run('my-command -x', function () {});
      connection.run('my-command2 -x', function () {});

      expect(childProcess.exec).to.be.calledWith(
        'ssh -p 22 user@host "my-command -x"'
      );

      expect(childProcess.exec).to.be.calledWith(
        'ssh -p 22 user@host "my-command2 -x"'
      );
    });
  });

  describe('#copy', function () {
    var connection;

    beforeEach(function () {
      connection = new Connection({
        remote: 'user@host',
        logger: logger
      });
    });

    it('should call cmd.spawn', function (done) {
      connection.copy('/src/dir', '/dest/dir', done);

      expect(childProcess.exec).to.be.calledWith('rsync -az -e "ssh -p 22" /src/dir user@host:/dest/dir');
    });

    it('should accept "ignores" option', function (done) {
      connection.copy('/src/dir', '/dest/dir', { ignores: ['a', 'b'] }, done);

      expect(childProcess.exec).to.be.calledWith('rsync --exclude a --exclude b -az -e ' +
        '"ssh -p 22" /src/dir user@host:/dest/dir');
    });
  });
});