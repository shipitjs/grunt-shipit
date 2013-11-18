/**
 * Module dependencies.
 */

var git = require('gift'),
  async = require('async');

/**
 * Expose repo.
 */

module.exports = createRepo;

/**
 * Create a new `Repo`.
 *
 * @param {String} path
 * @param {String} url
 * @param {Function} callback
 * @return {repo}
 */

function createRepo(path, url, callback) {
  var repo;

  async.waterfall([
    git.init.bind(git, path),
    function (_repo, next) {
      repo = _repo;
      repo.config(next);
    },
    function (config, next) {
      if (config.items['remote.shipit.url']) return next();
      repo.remote_add('shipit', url, next);
    },
    function (next) {
      repo.remote_fetch('shipit', next);
    },
    function (next) {
      next(null, repo);
    }
  ], callback);
}