module.exports = function (shipit) {
  /**
   * Initialize config.
   */

  shipit.initConfig({
    options: {
      buildDir: '/my/build/dir',
      repositoryUrl: '/my/repo/url',
      ignores: ['.git', 'node_modules']
    },
    development: {
      servers: 'deploy@localhost'
    },
    staging: {
      servers: ['staging1.host.com', 'staging2.host.com']
    },
    production: {
      servers: ['production1.host.com', 'production2.host.com']
    }
  });

  /**
   * Initialize tasks.
   */

  shipit.registerTask('build', 'Build project', function () {
    shipit.local('ls', this.async());
  });

  shipit.registerTask('remote:install', function (callback) {
    shipit.remote('ls', callback);
  });

  shipit.registerTask('remote:restart', function (callback) {
    shipit.remote('service my-app restart', callback);
  });

  /**
   * Initialize hooks.
   */

  shipit.on('fetched', function (next) {
    shipit.runTask('build', next);
  });

  shipit.on('updated', function (next) {
    shipit.runTask('remote:install', next);
  });

  shipit.on('finished', function (next) {
    shipit.runTask('remote:restart', next);
  });
};