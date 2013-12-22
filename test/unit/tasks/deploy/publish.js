var sinon = require('sinon');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('../../../../lib/shipit');
var publishFactory = require('../../../../lib/tasks/deploy/publish');
var runTask = require('../../../helpers/run-task');
var gruntLog = require('../../../helpers/grunt-log');

describe('deploy:publish task', function () {
  var shipit, publish;

  beforeEach(function () {
    shipit = new Shipit('test');
    publish = publishFactory(shipit);
    gruntLog.silent();

    // Shipit config
    shipit.initConfig({
      test: {
        deployTo: '/remote/deploy'
      }
    });

    shipit.releasePath = '/remote/deploy/releases/20141704123138';

    sinon.stub(shipit, 'remote').yields();
  });

  afterEach(function () {
    gruntLog.restore();
    shipit.remote.restore();
  });

  it('should update the synonym link', function (done) {
    runTask(shipit, 'deploy:publish', function () {
      expect(shipit.currentPath).to.equal('/remote/deploy/current');
      expect(shipit.remote).to.be.calledWith('rm -rf /remote/deploy/current && ' +
        'ln -s /remote/deploy/releases/20141704123138 /remote/deploy/current');
      done();
    });
  });
});