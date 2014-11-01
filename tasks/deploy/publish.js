/**
 * Module dependencies.
 */

var async = require('async');
var path = require('path');

/**
 * Publish task.
 * - Update synonym link.
 */

module.exports = function (grunt) {
  grunt.registerTask('deploy:publish', function () {
    var done = this.async();

    async.series([
      updateSynonymLink
    ], function (err) {
      if (err) return done(err);
      grunt.shipit.emit('published');
      done();
    });

    /**
     * Update synonym link.
     *
     * @param {Function} cb
     */

    function updateSynonymLink(cb) {
      grunt.log.writeln('Publishing release "%s"', grunt.shipit.releasePath);

      grunt.shipit.currentPath = path.join(grunt.shipit.config.deployTo, 'current');

      grunt.shipit.remote('ln -nfs ' + grunt.shipit.releasePath + ' ' + grunt.shipit.currentPath,
        function (err) {
          if (err) return cb(err);
          grunt.log.oklns('Release published.');
          cb();
        });
    }
  });
};