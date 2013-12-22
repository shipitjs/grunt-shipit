var sinon = require('sinon');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('../../../../lib/shipit');
var updateFactory = require('../../../../lib/tasks/deploy/update');
var runTask = require('../../../helpers/run-task');
var gruntLog = require('../../../helpers/grunt-log');

describe('deploy:update task', function () {
  var shipit, update, clock;

  beforeEach(function () {
    shipit = new Shipit('test');
    update = updateFactory(shipit);
    clock = sinon.useFakeTimers(1397730698075);
    gruntLog.silent();

    // Shipit config
    shipit.initConfig({
      test: {
        workspace: '/tmp/workspace',
        deployTo: '/remote/deploy'
      }
    });

    sinon.stub(shipit, 'remote').yields();
    sinon.stub(shipit, 'remoteCopy').yields();
  });

  afterEach(function () {
    gruntLog.restore();
    clock.restore();
    shipit.remote.restore();
    shipit.remoteCopy.restore();
  });

  it('should create release path, and do a remote copy', function (done) {
    runTask(shipit, 'deploy:update', function () {
      expect(shipit.releaseDirname).to.equal('20141704123138');
      expect(shipit.releasesPath).to.equal('/remote/deploy/releases');
      expect(shipit.releasePath).to.equal('/remote/deploy/releases/20141704123138');
      expect(shipit.remote).to.be.calledWith('mkdir -p /remote/deploy/releases/20141704123138');
      expect(shipit.remoteCopy).to.be.calledWith('/tmp/workspace/', '/remote/deploy/releases/20141704123138');
      done();
    });

    clock.tick(5);
  });
});