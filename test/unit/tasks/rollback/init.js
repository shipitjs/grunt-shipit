var sinon = require('sinon');
var grunt = require('grunt');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('../../../../lib/shipit');
var initFactory = require('../../../../tasks/rollback/init');
var runTask = require('../../../helpers/run-task');
var gruntLog = require('../../../helpers/grunt-log');

describe('rollback:init task', function () {
  var shipit;

  beforeEach(function () {
    grunt.shipit = shipit = new Shipit();
    shipit.stage = 'test';
    initFactory(grunt);
    gruntLog.silent();

    // Shipit config
    shipit.initConfig({
      test: {
        workspace: '/tmp/workspace',
        deployTo: '/remote/deploy'
      }
    });
  });

  afterEach(function () {
    gruntLog.restore();
  });

  describe('#getCurrentReleaseDirName', function () {
    describe('unsync server', function () {
      beforeEach(function () {
        sinon.stub(shipit, 'remote', function (command, cb) {
          if (command === 'readlink /remote/deploy/current')
            return cb(null, [
              '/remote/deploy/releases/20141704123138',
              '/remote/deploy/releases/20141704123137'
            ]);
        });
      });

      afterEach(function () {
        shipit.remote.restore();
      });

      it('should return an error', function (done) {
        runTask('rollback:init', function (err) {
          expect(err.message).to.equal('Remote server are not synced.');
          done();
        });
      });
    });

    describe('bad release dirname', function () {
      beforeEach(function () {
        sinon.stub(shipit, 'remote', function (command, cb) {
          if (command === 'readlink /remote/deploy/current')
            return cb(null, []);
        });
      });

      afterEach(function () {
        shipit.remote.restore();
      });

      it('should return an error', function (done) {
        runTask('rollback:init', function (err) {
          expect(err.message).to.equal('Cannot find current release dirname.');
          done();
        });
      });
    });
  });

  describe('#getReleases', function () {
    describe('unsync server', function () {
      beforeEach(function () {
        sinon.stub(shipit, 'remote', function (command, cb) {
          if (command === 'readlink /remote/deploy/current')
            return cb(null, [
              '/remote/deploy/releases/20141704123137'
            ]);
          if(command === 'ls -r1 /remote/deploy/releases')
            return cb(null, [
              '20141704123137\n20141704123134\n',
              '20141704123137\n20141704123133\n'
            ]);
        });
      });

      afterEach(function () {
        shipit.remote.restore();
      });

      it('should return an error', function (done) {
        runTask('rollback:init', function (err) {
          expect(err.message).to.equal('Remote server are not synced.');
          done();
        });
      });
    });

    describe('bad releases', function () {
      beforeEach(function () {
        sinon.stub(shipit, 'remote', function (command, cb) {
          if (command === 'readlink /remote/deploy/current')
            return cb(null, [
              '/remote/deploy/releases/20141704123137'
            ]);
          if(command === 'ls -r1 /remote/deploy/releases')
            return cb(null, []);
        });
      });

      afterEach(function () {
        shipit.remote.restore();
      });

      it('should return an error', function (done) {
        runTask('rollback:init', function (err) {
          expect(err.message).to.equal('Cannot read releases.');
          done();
        });
      });
    });
  });

  describe('release not exists', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'remote', function (command, cb) {
        if (command === 'readlink /remote/deploy/current')
          return cb(null, [
            '/remote/deploy/releases/20141704123137'
          ]);
        if(command === 'ls -r1 /remote/deploy/releases')
          return cb(null, ['20141704123137']);
      });
    });

    afterEach(function () {
      shipit.remote.restore();
    });

    it('should return an error', function (done) {
      runTask('rollback:init', function (err) {
        expect(err.message).to.equal('Cannot rollback, release not found.');
        done();
      });
    });
  });

  describe('all good', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'remote', function (command, cb) {
        if (command === 'readlink /remote/deploy/current')
          return cb(null, [
            '/remote/deploy/releases/20141704123137\n'
          ]);
        if(command === 'ls -r1 /remote/deploy/releases')
          return cb(null, ['20141704123137\n20141704123136\n']);
      });
    });

    afterEach(function () {
      shipit.remote.restore();
    });

    it('define path', function (done) {
      runTask('rollback:init', function (err) {
        if (err) return done(err);
        expect(shipit.currentPath).to.equal('/remote/deploy/current');
        expect(shipit.releasesPath).to.equal('/remote/deploy/releases');
        expect(shipit.remote).to.be.calledWith('readlink /remote/deploy/current');
        expect(shipit.remote).to.be.calledWith('ls -r1 /remote/deploy/releases');
        expect(shipit.releaseDirname).to.equal('20141704123136');
        expect(shipit.releasePath).to.equal('/remote/deploy/releases/20141704123136');
        done();
      });
    });
  });
});