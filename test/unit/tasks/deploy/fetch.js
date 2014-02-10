var rewire = require('rewire');
var grunt = require('grunt');
var sinon = require('sinon');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('../../../../lib/shipit');
var fetchFactory = rewire('../../../../tasks/deploy/fetch');
var mkdirpMock = require('../../../mocks/mkdirp');
var runTask = require('../../../helpers/run-task');
var gruntLog = require('../../../helpers/grunt-log');

describe('deploy:fetch task', function () {
  var shipit;

  beforeEach(function () {
    grunt.shipit = shipit = new Shipit();
    shipit.stage = 'test';
    fetchFactory(grunt);
    gruntLog.silent();

    fetchFactory.__set__('mkdirp', mkdirpMock);

    // Shipit config
    shipit.initConfig({
      test: {
        workspace: '/tmp/workspace',
        repositoryUrl: 'git://website.com/user/repo'
      }
    });

    sinon.stub(grunt.shipit, 'local').yields();
  });

  afterEach(function () {
    mkdirpMock.reset();
    gruntLog.restore();
    grunt.shipit.local.restore();
  });

  it('should create workspace, create repo, checkout and call sync', function (done) {
    runTask('deploy:fetch', function (err) {
      if (err) return done(err);
      expect(mkdirpMock).to.be.calledWith('/tmp/workspace');
      expect(grunt.shipit.local).to.be.calledWith('git init', { cwd: '/tmp/workspace' });
      expect(grunt.shipit.local).to.be.calledWith('git remote', { cwd: '/tmp/workspace' });
      expect(grunt.shipit.local).to.be.calledWith(
        'git remote add shipit git://website.com/user/repo',
        { cwd: '/tmp/workspace' }
      );
      expect(grunt.shipit.local).to.be.calledWith('git fetch shipit -p', { cwd: '/tmp/workspace' });
      expect(grunt.shipit.local).to.be.calledWith('git checkout master', { cwd: '/tmp/workspace' });
      expect(grunt.shipit.local).to.be.calledWith('git branch --list master', { cwd: '/tmp/workspace' });
      done();
    });
  });
});