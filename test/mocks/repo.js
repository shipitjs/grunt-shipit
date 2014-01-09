/**
 * Module dependencies.
 */

var sinon = require('sinon');

/**
 * Expose methods.
 */

module.exports = sinon.spy(createRepo);
module.exports.getRepo = getRepo;

/**
 * Repo mock.
 */

var repo;

/**
 * Create repo mock.
 */

function createRepo(path, url, cb) {
  repo = {
    checkout: sinon.stub().yields(),
    sync: sinon.stub().yields()
  };

  cb(null, repo);
}

/**
 * Return mocked repo.
 */

function getRepo() {
  return repo;
}