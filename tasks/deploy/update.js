/**
 * Module dependencies.
 */

var async = require('async');
var path = require('path');

/**
 * Update task.
 * - Create and define release path.
 * - Remote copy project.
 */

module.exports = function (grunt) {
  grunt.registerTask('deploy:update', function () {
    var done = this.async();

    async.series([
      createReleasePath,
      remoteCopy
    ], function (err) {
      if (err) return done(err);
      grunt.shipit.emit('updated');
      done();
    });

    /**
     * Create and define release path.
     *
     * @param {Function} cb
     */

    function createReleasePath(cb) {
      grunt.shipit.releaseDirname = grunt.template.date('yyyymmddHHMMss');
      grunt.shipit.releasesPath = path.join(grunt.shipit.config.deployTo, 'releases');
      grunt.shipit.releasePath = path.join(grunt.shipit.releasesPath, grunt.shipit.releaseDirname);

      grunt.log.writeln('Create release path "%s"', grunt.shipit.releasePath);
      grunt.shipit.remote('mkdir -p ' + grunt.shipit.releasePath, function (err) {
        if (err) return cb(err);
        grunt.log.oklns('Release path created.');
        cb();
      });
    }

    /**
     * Remote copy project.
     *
     * @param {Function} cb
     */

    function remoteCopy(cb) {
      grunt.log.writeln('Copy project to remote servers.');

      grunt.shipit.remoteCopy(grunt.shipit.config.workspace + '/', grunt.shipit.releasePath, function (err) {
        if (err) return cb(err);
        grunt.log.oklns('Finished copy.');
        cb();
      });
    }
  });
};