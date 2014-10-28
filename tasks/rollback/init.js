/**
 * Module dependencies.
 */

var async = require('async');
var path = require('path');
var _ = require('lodash');

/**
 * Update task.
 * - Create and define release path.
 * - Remote copy project.
 */

module.exports = function (grunt) {
  grunt.registerTask('rollback:init', function () {
    var done = this.async();

    async.series([
      defineReleasePath
    ], function (err) {
      if (err) return done(err);
      grunt.shipit.emit('rollback');
      done();
    });

    /**
     * Define release path to rollback.
     *
     * @param {Function} cb
     */

    function defineReleasePath(cb) {
      grunt.shipit.currentPath = path.join(grunt.shipit.config.deployTo, 'current');
      grunt.shipit.releasesPath = path.join(grunt.shipit.config.deployTo, 'releases');

      grunt.log.writeln('Get current release dirname.');

      getCurrentReleaseDirname(function (err, currentRelease) {
        if (err) return cb(err);

        if (! currentRelease)
          return cb(new Error('Cannot find current release dirname.'));

        grunt.log.writeln('Current release dirname : %s.', currentRelease);

        grunt.log.writeln('Getting dist releases.');

        getReleases(function (err, releases) {
          if (err) return cb(err);

          if (! releases)
            return cb(new Error('Cannot read releases.'));

          grunt.log.writeln('Dist releases : %j.', releases);

          var currentReleaseIndex = releases.indexOf(currentRelease);
          var rollbackReleaseIndex = currentReleaseIndex + 1;

          grunt.shipit.releaseDirname = releases[rollbackReleaseIndex];

          grunt.log.writeln('Will rollback to %s.', grunt.shipit.releaseDirname);

          if (! grunt.shipit.releaseDirname)
            return cb(new Error('Cannot rollback, release not found.'));

          grunt.shipit.releasePath = path.join(grunt.shipit.releasesPath, grunt.shipit.releaseDirname);

          cb();
        });
      });

      /**
       * Return the current release dirname.
       *
       * @param {Function} cb
       */

      function getCurrentReleaseDirname(cb) {
        grunt.shipit.remote('readlink ' + grunt.shipit.currentPath, function (err, targets) {
          if (err) return cb(err);

          var releaseDirnames = targets.map(computeReleaseDirname);

          if (! equalValues(releaseDirnames))
            return cb(new Error('Remote server are not synced.'));

          cb(null, releaseDirnames[0]);
        });
      }

      /**
       * Compute the current release dir name.
       *
       * @param {String} link
       * @returns {String}
       */

      function computeReleaseDirname(target) {
        if (! target) return null;

        // Trim last breakline.
        target = target.replace(/\n$/, '');

        return target.split(path.sep).pop();
      }


      /**
       * Return all remote releases.
       *
       * @param {Function} cb
       */

      function getReleases(cb) {
        grunt.shipit.remote('ls -r1 ' + grunt.shipit.releasesPath, function (err, dirs) {
          if (err) return cb(err);

          var releases = dirs.map(computeReleases);

          if (! equalValues(releases))
            return cb(new Error('Remote server are not synced.'));

          cb(null, releases[0]);
        });
      }

      /**
       * Compute the current release dir name.
       *
       * @param {String} link
       * @returns {String}
       */

      function computeReleases(dirs) {
        if (! dirs) return null;

        // Trim last breakline.
        dirs = dirs.replace(/\n$/, '');

        // Convert releases to an array.
        return dirs.split('\n');
      }

      /**
       * Test if all values are equal.
       *
       * @param {Array} values
       * @returns {Boolean}
       */

      function equalValues(values) {
        return values.every(function (value) {
            return _.isEqual(value, values[0]);
        });
      }
    }
  });
};