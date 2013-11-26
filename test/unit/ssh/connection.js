var chai = require('chai'),
  events = require('events'),
  expect = chai.expect,
  sinon = require('sinon'),
  childProcess = require('child_process'),
  remote = require('../../../lib/ssh/remote'),
  Connection = require('../../../lib/ssh/connection');

chai.use(require('sinon-chai'));

describe('SSH Connection', function () {
  describe('constructor', function () {
    beforeEach(function () {
      sinon.stub(remote, 'format').returns('user@host');
      sinon.stub(remote, 'parse').returns({ user: 'user', host: 'host' });
    });

    afterEach(function () {
      remote.format.restore();
      remote.parse.restore();
    });

    it('should accept config', function () {
      var connection = new Connection({ user: 'user', host: 'host' });
      expect(connection.config).to.be.deep.equal({ user: 'user', host: 'host' });
      expect(connection.remote).to.be.deep.equal('user@host');
    });

    it('should accept remote', function () {
      var connection = new Connection('user@host');
      expect(connection.config).to.deep.equal({ user: 'user', host: 'host' });
      expect(connection.remote).to.be.deep.equal('user@host');
    });
  });

  describe('#spawn', function () {
    var connection;

    beforeEach(function () {
      sinon.stub(childProcess, 'spawn').returns('spawn');
      connection = new Connection('user@host');
    });

    afterEach(function () {
      childProcess.spawn.restore();
    });

    it('should spawn a new ssh process', function () {
      expect(connection.spawn('my-command')).to.equal('spawn');
      expect(childProcess.spawn).to.be.calledWith('ssh', [connection.remote, 'my-command']);
    });
  });

  describe('#run', function () {
    var connection, childProcessObj;

    beforeEach(function () {
      connection = new Connection('user@host');
      childProcessObj = new events.EventEmitter();
      childProcessObj.stderr = new events.EventEmitter();
      childProcessObj.stdout = new events.EventEmitter();
      sinon.stub(connection, 'spawn').returns(childProcessObj);
    });

    it('should not return an error if the code is 0', function (done) {
      connection.run('my-command', done);

      expect(connection.spawn).to.be.calledWith('my-command');

      childProcessObj.emit('close', 0);
    });

    it('should return an error if the code is not 0', function (done) {
      connection.run('my-command', function (err) {
        expect(err).to.exists;
        done();
      });

      expect(connection.spawn).to.be.calledWith('my-command');

      childProcessObj.emit('close', 2);
    });
  });

  describe('#copy', function () {
    var connection, childProcessObj;

    beforeEach(function () {
      connection = new Connection('user@host');
      childProcessObj = new events.EventEmitter();
      childProcessObj.stderr = new events.EventEmitter();
      childProcessObj.stdout = new events.EventEmitter();
      sinon.stub(childProcess, 'spawn').returns(childProcessObj);
    });

    afterEach(function () {
      childProcess.spawn.restore();
    });

    it('should not return an error if the code is 0', function (done) {
      connection.copy('/src/dir', '/dest/dir', done);

      expect(childProcess.spawn).to.be.calledWith('rsync', [
        '-az',
        '-e',
        'ssh',
        '/src/dir',
        'user@host:/dest/dir'
      ]);

      childProcessObj.emit('close', 0);
    });

    it('should return an error if the code is not 0', function (done) {
      connection.copy('/src/dir', '/dest/dir', function (err) {
        expect(err).to.exists;
        done();
      });

      expect(childProcess.spawn).to.be.calledWith('rsync', [
        '-az',
        '-e',
        'ssh',
        '/src/dir',
        'user@host:/dest/dir'
      ]);

      childProcessObj.emit('close', 2);
    });

    it('should accept "ignores" option', function (done) {
      connection.copy('/src/dir', '/dest/dir', { ignores: ['a', 'b'] }, done);

      expect(childProcess.spawn).to.be.calledWith('rsync', [
        '--exclude',
        'a',
        '--exclude',
        'b',
        '-az',
        '-e',
        'ssh',
        '/src/dir',
        'user@host:/dest/dir'
      ]);

      childProcessObj.emit('close', 0);
    });
  });
});