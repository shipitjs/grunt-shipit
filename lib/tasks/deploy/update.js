/**
 * Module dependencies.
 */

var async = require('async');
var grunt = require('grunt');
var moment = require('moment');
var path = require('path');

/**
 * Update task.
 * - createRelasePath
 * - remoteCopy
 */

module.exports = function (shipit) {
  shipit.registerTask('deploy:update', function () {
    var done = this.async();

    async.series([
      createReleasePath,
      remoteCopy
    ], function (err) {
      if (err) return done(err);
      shipit.emit('updated');
      done();
    });

    /**
     * Create release path.
     *
     * @param {Function} cb
     */

    function createReleasePath(cb) {
      shipit.releaseDirname = moment().format('YYYYDDMMHHmmss');
      shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');
      shipit.releasePath = path.join(shipit.releasesPath, shipit.releaseDirname);

      grunt.log.writeln('Create release path "%s"', shipit.releasePath);
      shipit.remote('mkdir -p ' + shipit.releasePath, function (err) {
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

      shipit.remoteCopy(shipit.config.workspace + '/', shipit.releasePath, function (err) {
        if (err) return cb(err);
        grunt.log.oklns('Finished copy.');
        cb();
      });
    }
  });
};