var rewire = require('rewire');
var grunt = require('grunt');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('../../../../lib/shipit');
var fetchFactory = rewire('../../../../tasks/deploy/fetch');
var mkdirpMock = require('../../../mocks/mkdirp');
var repoMock = require('../../../mocks/repo');
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
    fetchFactory.__set__('repo', repoMock);

    // Shipit config
    shipit.initConfig({
      test: {
        workspace: '/tmp/workspace',
        repositoryUrl: 'git://website.com/user/repo'
      }
    });
  });

  afterEach(function () {
    mkdirpMock.reset();
    repoMock.reset();
    gruntLog.restore();
  });

  it('should create workspace, create repo and checkout', function (done) {
    runTask('deploy:fetch', function (err) {
      if (err) return done(err);
      expect(mkdirpMock).to.be.calledWith('/tmp/workspace');
      expect(repoMock).to.be.calledWith('/tmp/workspace', 'git://website.com/user/repo');
      expect(shipit.repository).to.exist;
      expect(repoMock.getRepo().checkout).to.be.calledWith('master');
      done();
    });
  });
});