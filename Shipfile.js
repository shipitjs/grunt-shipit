module.exports = function (shipit) {
  /**
   * Initialize config.
   */

  shipit.initConfig({
    options: {
      workspace: '/tmp/github-monitor',
      deployTo: '/tmp/deploy_to',
      repositoryUrl: 'https://github.com/neoziro/github-monitor.git',
      ignores: ['.git', 'node_modules']
    },
    development: {
      servers: 'neoziro@localhost'
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

  shipit.registerTask('remote:install', function () {
    shipit.remote('ls', this.async());
  });

  shipit.registerTask('remote:restart', function () {
    shipit.remote('service my-app restart', this.async());
  });

  /**
   * Initialize hooks.
   */

  shipit.on('fetched', function () {
    shipit.runTask('build');
  });

  shipit.on('updated', function () {
    shipit.runTask('remote:install');
  });

  shipit.on('finished', function (next) {
    shipit.runTask('remote:restart', next);
  });
};