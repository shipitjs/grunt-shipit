/**
 * Module dependencies.
 */

var async = require('async');
var mkdirp = require('mkdirp');

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
      initRepository,
      addRemote,
      fetch,
      checkout,
      merge
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
     * Initialize repository.
     *
     * @param {Function} cb
     */

    function initRepository(cb) {
      grunt.log.writeln('Initialize local repository in "%s"', grunt.shipit.config.workspace);
      grunt.shipit.local('git init', { cwd: grunt.shipit.config.workspace }, function (err) {
        if (err) return cb(err);
        grunt.log.oklns('Repository initialized.');
        cb();
      });
    }

    /**
     * Add remote.
     *
     * @param {Function} cb
     */

    function addRemote(cb) {
      grunt.log.writeln('List local remotes.');

      // List remotes.
      grunt.shipit.local('git remote', { cwd: grunt.shipit.config.workspace }, function (err, stdout) {
        if (err) return cb(err);
        var remotes = stdout ? stdout.split(/\s/) : [];
        var method = remotes.indexOf('shipit') !== -1 ? 'set-url' : 'add';

        grunt.log.writeln('Update remote "%s" to local repository "%s"',
        grunt.shipit.config.repositoryUrl, grunt.shipit.config.workspace);

        // Update remote.
        grunt.shipit.local(
          'git remote ' + method + ' shipit ' + grunt.shipit.config.repositoryUrl,
          { cwd: grunt.shipit.config.workspace },
          function (err) {
            if (err) return cb(err);
            grunt.log.oklns('Remote updated.');
            cb();
          }
        );
      });
    }

    /**
     * Fetch repository.
     *
     * @param {Function} cb
     */

    function fetch(cb) {
      grunt.log.writeln('Fetching repository "%s"', grunt.shipit.config.repositoryUrl);
      grunt.shipit.local(
        'git fetch shipit -p',
        { cwd: grunt.shipit.config.workspace },
        function (err) {
          if (err) return cb(err);
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
      grunt.shipit.local(
        'git checkout ' + grunt.shipit.config.branch,
        { cwd: grunt.shipit.config.workspace },
        function (err) {
          if (err) return cb(err);
          grunt.log.oklns('Checked out.');
          cb();
        }
      );
    }

    /**
     * Merge branch.
     *
     * @param {Function} cb
     */

    function merge(cb) {
      grunt.log.writeln('Testing if commit-ish is a branch.');

      // Test if commit-ish is a branch.
      grunt.shipit.local(
        'git branch --list ' + grunt.shipit.config.branch,
        { cwd: grunt.shipit.config.workspace },
        function (err, stdout) {
          if (err) return cb(err);
          var isBranch = !! stdout;
          if (! isBranch) {
            grunt.log.oklns('No branch, no merge.');
            return cb();
          }

          grunt.log.writeln('Commit-ish is a branch, merging...');

          // Merge branch.
          grunt.shipit.local(
            'git merge shipit/' + grunt.shipit.config.branch,
            { cwd: grunt.shipit.config.workspace },
            function (err) {
              if (err) return cb(err);
              grunt.log.oklns('Branch merged.');
              cb();
            }
          );
        }
      );
    }
  });
};