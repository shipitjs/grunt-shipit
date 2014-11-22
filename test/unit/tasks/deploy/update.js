var sinon = require('sinon');
var grunt = require('grunt');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('../../../../lib/shipit');
var updateFactory = require('../../../../tasks/deploy/update');
var runTask = require('../../../helpers/run-task');
var gruntLog = require('../../../helpers/grunt-log');

describe('deploy:update task', function () {
  var shipit, clock;

  beforeEach(function () {
    grunt.shipit = shipit = new Shipit();
    shipit.stage = 'test';
    updateFactory(grunt);
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
    runTask('deploy:update', function (err) {
      if (err) return done(err);
      var dirName = grunt.template.date('yyyymmddHHMMss');
      expect(shipit.releaseDirname).to.equal(dirName);
      expect(shipit.releasesPath).to.equal('/remote/deploy/releases');
      expect(shipit.releasePath).to.equal('/remote/deploy/releases/' + dirName);
      expect(shipit.remote).to.be.calledWith('mkdir -p /remote/deploy/releases/' + dirName);
      expect(shipit.remoteCopy).to.be.calledWith('/tmp/workspace/', '/remote/deploy/releases/' + dirName);
      done();
    });

    clock.tick(5);
  });
});