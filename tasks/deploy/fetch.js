/**
 * Module dependencies.
 */

var async = require('async');
var mkdirp = require('mkdirp');
var repo = require('../../lib/repo');

/**
 * Fetch task.
 * - Create workspace.
 * - Fetch repository.
 * - Checkout commit-ish.
 */

module.exports = function (grunt) {
  grunt.registerTask('deploy:fetch', function () {
    var done = this.async();

    async.series([
      createWorkspace,
      fetch,
      checkout
    ], function (err) {
      if (err) return done(err);
      grunt.shipit.emit('fetched');
      done();
    });

    /**
     * Create workspace.
     *
     * @param {Function} cb
     */

    function createWorkspace(cb) {
      grunt.log.writeln('Create workspace "%s"', grunt.shipit.config.workspace);
      mkdirp(grunt.shipit.config.workspace, cb);
      grunt.log.oklns('Workspace created.');
    }

    /**
     * Fetch repository.
     *
     * @param {Function} cb
     */

    function fetch(cb) {
      grunt.log.writeln('Fetching repository "%s"', grunt.shipit.config.repositoryUrl);
      repo(grunt.shipit.config.workspace, grunt.shipit.config.repositoryUrl,
        function (err, repository) {
          if (err) return cb(err);
          grunt.shipit.repository = repository;
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
      grunt.log.writeln('Checking out commit-ish "%s"', grunt.shipit.config.branch);
      grunt.shipit.repository.checkout(grunt.shipit.config.branch, cb);
      grunt.log.oklns('Checked out.');
    }
  });
};