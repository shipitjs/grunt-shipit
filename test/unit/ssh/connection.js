var rewire = require('rewire');
var sinon = require('sinon');
var expect = require('chai').use(require('sinon-chai')).expect;
var cmd = require('../../mocks/command');
var remote = require('../../../lib/ssh/remote');
var Connection = rewire('../../../lib/ssh/connection');

describe('SSH Connection', function () {
  beforeEach(function () {
    Connection.__set__('cmd', cmd);
  });

  afterEach(function () {
    cmd.restore();
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

  describe('#run', function () {
    var connection;

    beforeEach(function () {
      connection = new Connection('user@host');
    });

    it('should call cmd.spawn', function (done) {
      connection.run('my-command', ['-x'], { cwd: '/root' }, done);

      expect(cmd.spawn).to.be.calledWith(
        'ssh',
        ['user@host', 'my-command', '-x'],
        { cwd: '/root', logPrefix: '@host ' }
      );
    });

    it('should handle sudo', function (done) {
      connection.run('sudo my-command', ['-x'], { cwd: '/root' }, done);

      expect(cmd.spawn).to.be.calledWith(
        'ssh',
        ['-tt', 'user@host', 'sudo my-command', '-x'],
        { cwd: '/root', logPrefix: '@host ' }
      );
    });

    it('should copy args', function () {
      var args = ['-x'];
      connection.run('my-command', args, function () {});
      connection.run('my-command2', args, function () {});

      expect(cmd.spawn).to.be.calledWith(
        'ssh',
        ['user@host', 'my-command', '-x']
      );

      expect(cmd.spawn).to.be.calledWith(
        'ssh',
        ['user@host', 'my-command2', '-x']
      );
    });
  });

  describe('#copy', function () {
    var connection;

    beforeEach(function () {
      connection = new Connection('user@host');
    });

    it('should call cmd.spawn', function (done) {
      connection.copy('/src/dir', '/dest/dir', done);

      expect(cmd.spawn).to.be.calledWith('rsync', [
        '-az',
        '-e',
        'ssh',
        '/src/dir',
        'user@host:/dest/dir'
      ]);
    });

    it('should accept "ignores" option', function (done) {
      connection.copy('/src/dir', '/dest/dir', { ignores: ['a', 'b'] }, done);

      expect(cmd.spawn).to.be.calledWith('rsync', [
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
    });
  });
});