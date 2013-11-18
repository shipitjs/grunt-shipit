/**
 * Module dependencies.
 */

var async = require('async'),
  grunt = require('grunt'),
  mkdirp = require('mkdirp'),
  repo = require('../repo');

/**
 * Fetch task.
 */

module.exports = function (shipit) {
  shipit.registerTask('deploy:fetch', function () {
    var done = this.async();

    async.series([
      function (done) {
        grunt.log.writeln('Create workspace "%s"', shipit.config.workspace);
        mkdirp(shipit.config.workspace, done);
        grunt.log.oklns('Workspace created.');
      },
      function (done) {
        grunt.log.writeln('Fetching repository "%s"', shipit.config.repositoryUrl);
        repo(shipit.config.workspace, shipit.config.repositoryUrl,
          function (err, repository) {
            if (err) return done(err);
            shipit.repository = repository;
            grunt.log.oklns('Repository fetched.');
            done();
          }
        );
      },
      function (done) {
        grunt.log.writeln('Checking out commit-ish "%s"', shipit.config.branch);
        shipit.repository.checkout(shipit.config.branch, done);
        grunt.log.oklns('Checked out.');
      }
    ], function (err) {
      if (err) return done(err);
      shipit.emit('fetched');
      done();
    });
  });
};