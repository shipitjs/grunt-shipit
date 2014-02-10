/**
 * Module dependencies.
 */

var async = require('async');

/**
 * Clean task.
 * - Remove old releases.
 */

module.exports = function (grunt) {
  grunt.registerTask('deploy:clean', function () {
    var done = this.async();

    async.series([
      cleanOldReleases
    ], function (err) {
      if (err) return done(err);
      grunt.shipit.emit('cleaned');
      done();
    });

    /**
     * Remove old releases.
     *
     * @param {Function} cb
     */

    function cleanOldReleases(cb) {
      grunt.log.writeln('Keeping "%d" last releases, cleaning others', grunt.shipit.config.keepReleases);
      var command = '(ls -rd ' + grunt.shipit.releasesPath +
      '/*|head -n ' + grunt.shipit.config.keepReleases + ';ls -d ' + grunt.shipit.releasesPath +
      '/*)|sort|uniq -u|xargs rm -rf';
      grunt.shipit.remote(command, cb);
    }
  });
};