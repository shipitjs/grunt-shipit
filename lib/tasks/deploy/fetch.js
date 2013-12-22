/**
 * Module dependencies.
 */

var async = require('async');
var grunt = require('grunt');
var mkdirp = require('mkdirp');
var repo = require('../../repo');

/**
 * Fetch task.
 * - Create workspace.
 * - Fetch repository.
 * - Checkout commit-ish.
 */

module.exports = function (shipit) {
  shipit.registerTask('deploy:fetch', function () {
    var done = this.async();

    async.series([
      createWorkspace,
      fetch,
      checkout
    ], function (err) {
      if (err) return done(err);
      shipit.emit('fetched');
      done();
    });

    /**
     * Create workspace.
     *
     * @param {Function} cb
     */

    function createWorkspace(cb) {
      grunt.log.writeln('Create workspace "%s"', shipit.config.workspace);
      mkdirp(shipit.config.workspace, cb);
      grunt.log.oklns('Workspace created.');
    }

    /**
     * Fetch repository.
     *
     * @param {Function} cb
     */

    function fetch(cb) {
      grunt.log.writeln('Fetching repository "%s"', shipit.config.repositoryUrl);
      repo(shipit.config.workspace, shipit.config.repositoryUrl,
        function (err, repository) {
          if (err) return cb(err);
          shipit.repository = repository;
          grunt.log.oklns('Repository fetched.');
          cb();
        }
      );
    }

    /**
     * Checkout commit-ish.
     *
     * @param {Function} cb
     */

    function checkout(cb) {
      grunt.log.writeln('Checking out commit-ish "%s"', shipit.config.branch);
      shipit.repository.checkout(shipit.config.branch, cb);
      grunt.log.oklns('Checked out.');
    }
  });
};