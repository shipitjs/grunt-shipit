var sinon = require('sinon');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('../../../../lib/shipit');
var cleanFactory = require('../../../../lib/tasks/deploy/clean');
var runTask = require('../../../helpers/run-task');
var gruntLog = require('../../../helpers/grunt-log');

describe('deploy:clean task', function () {
  var shipit, clean;

  beforeEach(function () {
    shipit = new Shipit('test');
    clean = cleanFactory(shipit);
    gruntLog.silent();

    // Shipit config
    shipit.initConfig({
      test: {
        keepReleases: 5
      }
    });

    shipit.releasesPath = '/remote/deploy/releases';

    sinon.stub(shipit, 'remote').yields();
  });

  afterEach(function () {
    gruntLog.restore();
    shipit.remote.restore();
  });

  it('should remove old releases', function (done) {
    runTask(shipit, 'deploy:clean', function () {
      expect(shipit.remote).to.be.calledWith('ls -rd1 /remote/deploy/releases | tail +6 | xargs rm -rf');
      done();
    });
  });
});