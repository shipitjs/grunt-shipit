/**
 * Module dependencies.
 */

var async = require('async');
var grunt = require('grunt');
var path = require('path');

/**
 * Publish task.
 */

module.exports = function (shipit) {
  shipit.registerTask('deploy:publish', function () {
    var done = this.async();

    async.series([
      function (done) {
        grunt.log.writeln('Publishing release "%s"', shipit.releasePath);

        shipit.currentPath = path.join(shipit.config.deployTo, 'current');

        shipit.remote('cd ' + shipit.config.deployTo + ' && rm -rf ' + shipit.currentPath +
          ' && ln -s ' + shipit.releaseDirname + ' ' + shipit.currentPath,
          function (err) {
            if (err) return done(err);
            grunt.log.oklns('Release published.');
            done();
          });
      }
    ], function (err) {
      if (err) return done(err);
      shipit.emit('published');
      done();
    });
  });
};