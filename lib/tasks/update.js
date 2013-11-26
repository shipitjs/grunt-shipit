/**
 * Module dependencies.
 */

var async = require('async');
var grunt = require('grunt');
var moment = require('moment');
var path = require('path');

/**
 * Fetch task.
 */

module.exports = function (shipit) {
  shipit.registerTask('deploy:update', function () {
    var done = this.async();

    async.series([
      function (done) {
        shipit.releasePath = path.join(shipit.config.deployTo, moment().format('YYYYDDMMHHMMss'));

        grunt.log.writeln('Create release path "%s"', shipit.releasePath);
        shipit.remote('mkdir -p ' + shipit.releasePath, function (err) {
          if (err) return done(err);
          grunt.log.oklns('Release path created.');
          done();
        });
      }
    ], function (err) {
      if (err) return done(err);
      shipit.emit('updated');
      done();
    });
  });
};