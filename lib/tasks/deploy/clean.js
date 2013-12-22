/**
 * Module dependencies.
 */

var async = require('async');
var grunt = require('grunt');

/**
 * Clean task.
 * - cleanOldReleases
 */

module.exports = function (shipit) {
  shipit.registerTask('deploy:clean', function () {
    var done = this.async();

    async.series([
      cleanOldReleases
    ], function (err) {
      if (err) return done(err);
      shipit.emit('cleaned');
      done();
    });

    /**
     * Clean old releases.
     *
     * @param {Function} cb
     */

    function cleanOldReleases(cb) {
      grunt.log.writeln('Keeping "%d" last releases, cleaning others', shipit.config.keepReleases);
      var command = 'ls -rd1 ' + shipit.releasesPath +
      ' | tail +' + (shipit.config.keepReleases + 1) + ' | xargs rm -rf';
      shipit.remote(command, cb);
    }
  });
};