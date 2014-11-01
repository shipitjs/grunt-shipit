var sinon = require('sinon');
var grunt = require('grunt');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('../../../../lib/shipit');
var publishFactory = require('../../../../tasks/deploy/publish');
var runTask = require('../../../helpers/run-task');
var gruntLog = require('../../../helpers/grunt-log');

describe('deploy:publish task', function () {
  var shipit;

  beforeEach(function () {
    grunt.shipit = shipit = new Shipit();
    shipit.stage = 'test';
    publishFactory(grunt);
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
    runTask('deploy:publish', function (err) {
      if (err) return done(err);
      expect(shipit.currentPath).to.equal('/remote/deploy/current');
      expect(shipit.remote).to.be.calledWith('ln -nfs /remote/deploy/releases/20141704123138 ' +
      '/remote/deploy/current');
      done();
    });
  });
});