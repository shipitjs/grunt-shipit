/**
 * Module dependencies.
 */

var async = require('async');
var mkdirp = require('mkdirp');
var repo = require('../../lib/repo');
var find = require('lodash').find;

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
      checkout,
      sync
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
      mkdirp(grunt.shipit.config.workspace, function (err) {
        if (err) return cb(err);
        grunt.log.oklns('Workspace created.');
        cb();
      });
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
      grunt.shipit.repository.checkout(grunt.shipit.config.branch, function (err) {
        if (err) return cb(err);
        grunt.log.oklns('Checked out.');
        cb();
      });
    }

    /**
     * Sync repo.
     *
     * @param {Function} cb
     */

    function sync(cb) {
      grunt.log.writeln('Sync branch "%s"', grunt.shipit.config.branch);
      grunt.shipit.repository.tags(function (err, tags) {
        if (err) return cb(err);

        // If it's a tag, we do nothing.
        if (find(tags, { name: grunt.shipit.config.branch})) {
          grunt.log.oklns('Repo synced.');
          return cb();
        }

        // Else we must sync the branch.
        grunt.shipit.repository.sync('shipit', grunt.shipit.config.branch, function (err) {
          if (err) return cb(err);
          grunt.log.oklns('Repo synced.');
          cb();
        });
      });
    }
  });
};