module.exports = function (grunt) {
  grunt.initConfig({
    shipit: {
      options: {
        workspace: '/tmp/deploy/myapp',
        deployTo: '/opt/web/myapp',
        repositoryUrl: 'https://github.com/user/repo.git',
        ignores: ['.*'],
        keepReleases: 2
      },
      staging: {
        servers: 'user@myserver.com'
      }
    }
  });

  grunt.loadNpmTasks('grunt-shipit');
  grunt.loadNpmTasks('shipit-deploy');

  /**
   * Initialize tasks.
   */

  grunt.registerTask('build', 'Build project', function () {
    grunt.shipit.local('grunt', this.async());
  });

  grunt.registerTask('remote:install', function () {
    grunt.shipit.remote('npm prune && npm rebuild', this.async());
  });

  grunt.registerTask('remote:restart', function () {
    grunt.shipit.remote('service myapp restart', this.async());
  });

  /**
   * Initialize hooks.
   */

  grunt.shipit.on('fetched', function () {
    grunt.task.run(['build']);
  });

  grunt.shipit.on('updated', function () {
    grunt.task.run(['remote:install']);
  });

  grunt.shipit.on('published', function () {
    grunt.task.run(['remote:restart']);
  });
};
