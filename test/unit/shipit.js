var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
var path = require('path');
var grunt = require('grunt');
var Shipit = require('../../lib/shipit');
var sh = require('../../lib/sh');
var ConnectionPool = require('../../lib/ssh/connection-pool');

chai.use(sinonChai);

describe('Shipit', function () {
  var shipit;

  beforeEach(function () {
    shipit = new Shipit('stage');
  });

  describe('constructor', function () {
    it('should add stage and initialize shipit', function () {
      expect(shipit.stage).to.equal('stage');
    });
  });

  describe('#initialize', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'initShipfile').returns(shipit);
      sinon.stub(shipit, 'initSshPool').returns(shipit);
    });

    afterEach(function () {
      shipit.initShipfile.restore();
      shipit.initSshPool.restore();
    });

    it('should add stage and initialize shipit', function () {
      shipit.initialize();
      expect(shipit.initShipfile).to.be.called;
      expect(shipit.initSshPool).to.be.called;
    });
  });

  describe('#initShipfile', function () {
    describe('if Shipfile is not found', function () {
      it('should throw an error if the shipfile is not found', function () {
        expect(shipit.initShipfile).to.throws;
      });
    });

    describe('with a valid Shipfile', function () {
      beforeEach(function () {
        sinon.stub(process, 'cwd').returns(path.resolve(__dirname + '/../fixtures'));
      });

      afterEach(function () {
        process.cwd.restore();
      });

      it('should load Shipfile module', function () {
        shipit.initShipfile();

        expect(shipit.__shipfile).to.be.true;
      });
    });
  });

  describe('#initSshPool', function () {
    it('should initialize an ssh pool', function () {
      shipit.config = { servers: ['deploy@my-server'] };
      shipit.initSshPool();

      expect(shipit.sshPool).to.be.instanceOf(ConnectionPool);
      expect(shipit.sshPool.connections[0].remote).to.equal('deploy@my-server');
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

  describe('#registerTask', function () {
    beforeEach(function () {
      sinon.stub(grunt.task, 'registerTask');
    });

    afterEach(function () {
      grunt.task.registerTask.restore();
    });

    it('should add a task', function () {
      shipit.registerTask('task', 'args');
      expect(grunt.task.registerTask).to.be.calledWith('shipit:task', 'args');
    });
  });

  describe('#runTask', function () {
    beforeEach(function () {
      sinon.stub(grunt.task, 'run');
      sinon.stub(grunt.task, 'start');
    });

    afterEach(function () {
      grunt.task.run.restore();
      grunt.task.start.restore();
    });

    it('should run task', function () {
      shipit.runTask('task');

      expect(grunt.task.run).to.be.calledWith(['shipit:task']);
      expect(grunt.task.start).to.be.called;
    });
  });

  describe('#clearQueue', function () {
    beforeEach(function () {
      sinon.stub(grunt.task, 'clearQueue');
    });

    afterEach(function () {
      grunt.task.clearQueue.restore();
    });

    it('should clear queue', function () {
      shipit.clearQueue();

      expect(grunt.task.clearQueue).to.be.called;
    });
  });

  describe('#local', function () {
    beforeEach(function () {
      sinon.stub(sh, 'run');
    });

    afterEach(function () {
      sh.run.restore();
    });

    it('should run local command', function () {
      shipit.local('my-command');

      expect(sh.run).to.be.calledWith('my-command');
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