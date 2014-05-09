var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var stream = require('mock-utf8-stream');
var sinonChai = require('sinon-chai');
var Shipit = require('../../lib/shipit');
var ConnectionPool = require('../../lib/ssh/connection-pool');

chai.use(sinonChai);

describe('Shipit', function () {
  var shipit, stdout, stderr;

  beforeEach(function () {
    stdout = new stream.MockWritableStream();
    stderr = new stream.MockWritableStream();
    shipit = new Shipit({
      stdout: stdout,
      stderr: stderr
    });
    shipit.stage = 'stage';
  });

  describe('#initialize', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'initSshPool').returns(shipit);
    });

    afterEach(function () {
      shipit.initSshPool.restore();
    });

    it('should add stage and initialize shipit', function () {
      shipit.initialize();
      expect(shipit.initSshPool).to.be.called;
    });
  });

  describe('#initSshPool', function () {
    it('should initialize an ssh pool', function () {
      shipit.config = { servers: ['deploy@my-server'] };
      shipit.initSshPool();

      expect(shipit.sshPool).to.be.instanceOf(ConnectionPool);
      expect(shipit.sshPool.connections[0].remote).to.deep.equal({ user: 'deploy', host: 'my-server' });
    });
  });

  describe('#initConfig', function () {
    it('should initialize config', function () {
      shipit.initConfig({ options: { foo: 'bar' }, stage: { kung: 'foo' } });

      expect(shipit.config).to.be.deep.equal({
        branch: 'master',
        keepReleases: 5,
        foo: 'bar',
        kung: 'foo'
      });
    });
  });

  describe('#local', function () {
    it('should wrap and log to stdout', function (done) {
      stdout.startCapture();
      var echo = shipit.local('echo "hello"', function (err) {
        if (err) return done(err);
        expect(stdout.capturedData).to.equal('@ hello\n');
        done();
      });

      // Should return a child process.
      expect(echo).to.have.property('stdout');
      expect(echo).to.have.property('stderr');
    });
  });

  describe('#remote', function () {
    beforeEach(function () {
      shipit.sshPool = { run: sinon.stub() };
    });

    it('should run command on sshPool', function () {
      shipit.remote('my-command');

      expect(shipit.sshPool.run).to.be.calledWith('my-command');
    });
  });

  describe('#remoteCopy', function () {
    beforeEach(function () {
      shipit.sshPool = { copy: sinon.stub() };
    });

    it('should run command on sshPool', function () {
      shipit.remoteCopy('src', 'dest');

      expect(shipit.sshPool.copy).to.be.calledWith('src', 'dest');
    });
  });
});