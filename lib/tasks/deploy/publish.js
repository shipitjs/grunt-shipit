/**
 * Module dependencies.
 */

var async = require('async');
var grunt = require('grunt');
var path = require('path');

/**
 * Publish task.
 * - publish
 */

module.exports = function (shipit) {
  shipit.registerTask('deploy:publish', function () {
    var done = this.async();

    async.series([
      publish
    ], function (err) {
      if (err) return done(err);
      shipit.emit('published');
      done();
    });

    /**
     * Publishing release.
     *
     * @param {Function} cb
     */

    function publish(cb) {
      grunt.log.writeln('Publishing release "%s"', shipit.releasePath);

      shipit.currentPath = path.join(shipit.config.deployTo, 'current');

      shipit.remote('rm -rf ' + shipit.currentPath + ' && ln -s ' + shipit.releasePath +
        ' ' + shipit.currentPath,
        function (err) {
          if (err) return cb(err);
          grunt.log.oklns('Release published.');
          cb();
        });
    }
  });
};