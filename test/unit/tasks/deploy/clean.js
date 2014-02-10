var sinon = require('sinon');
var grunt = require('grunt');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('../../../../lib/shipit');
var cleanFactory = require('../../../../tasks/deploy/clean');
var runTask = require('../../../helpers/run-task');
var gruntLog = require('../../../helpers/grunt-log');

describe('deploy:clean task', function () {
  var shipit;

  beforeEach(function () {
    grunt.shipit = shipit = new Shipit();
    shipit.stage = 'test';
    cleanFactory(grunt);
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
    runTask('deploy:clean', function (err) {
      if (err) return done(err);
      expect(shipit.remote).to.be.calledWith('(ls -rd /remote/deploy/releases/*|head -n 5;ls -d ' +
        grunt.shipit.releasesPath + '/*)|sort|uniq -u|' +
        'xargs rm -rf');
      done();
    });
  });
});