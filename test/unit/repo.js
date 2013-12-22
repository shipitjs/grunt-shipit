var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var git = require('gift');
var createRepo = require('../../lib/repo');

chai.use(require('sinon-chai'));

describe('Repository', function () {
  var config, repo;

  beforeEach(function () {
    config = {
      items: {}
    };

    repo = {
      config: sinon.stub().yields(null, config),
      remote_add: sinon.stub().yields(),
      remote_fetch: sinon.stub().yields()
    };

    sinon.stub(git, 'init').yields(null, repo);
  });

  afterEach(function () {
    git.init.restore();
  });

  describe('with no remote', function () {
    it('should init, add remote and fetch', function (done) {
      createRepo('/my/build/dir', 'git@github.com:neoziro/shipit.git', function (err) {
        if (err) return done(err);
        expect(git.init).to.be.calledWith('/my/build/dir');
        expect(repo.remote_add).to.be.calledWith('shipit', 'git@github.com:neoziro/shipit.git');
        expect(repo.remote_fetch).to.be.calledWith('shipit');
        done();
      });
    });
  });

  describe('with an existing remote', function () {
    beforeEach(function () {
      config.items['remote.shipit.url'] = 'git@github.com:neoziro/shipit.git';
    });

    it('should init and fetch', function (done) {
      createRepo('/my/build/dir', 'git@github.com:neoziro/shipit.git', function (err) {
        if (err) return done(err);
        expect(git.init).to.be.calledWith('/my/build/dir');
        expect(repo.remote_fetch).to.be.calledWith('shipit');
        done();
      });
    });
  });
});