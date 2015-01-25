module.exports = function (grunt) {
  grunt.initConfig({
    shipit: {
      options: {},
      staging: {
        servers: 'myserver.com'
      }
    }
  });

  grunt.loadTasks('tasks');

  grunt.registerTask('test', function () {
    var done = this.async();
    grunt.shipit.local('echo "hello"', function (err, res) {
      if (err) return done(err);

      if (res.stdout !== 'hello\n')
        done(new Error('test not passing'));

      done();
    });
  });
};
