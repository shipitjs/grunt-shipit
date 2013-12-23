module.exports = function (shipit) {

  /**
   * Initialize config.
   */

  shipit.initConfig({

    // Options

    options: {
      // Build directory.
      workspace: '/my/build/dir',

      // Remote directory to deploy.
      // This directory contains two sub-directories :
      // - current
      // - releases
      deployTo: '/tmp/deploy_to',

      // Repository url.
      repositoryUrl: 'https://github.com/neoziro/github-monitor.git',

      // Files ignored in the rsync copy.
      ignores: ['.git', 'node_modules'],

      // Maximum releases to keep, default 5.
      keepReleases: 2
    },

    // Stages

    development: {
      // You can define server as simple string.
      // user@server
      // default user is deploy
      servers: 'neoziro@localhost'
    },
    staging: {
      // You can use an array of servers.
      servers: ['staging1.host.com', 'staging2.host.com']
    },
    production: {
      servers: ['production1.host.com', 'production2.host.com']
    }
  });

  /**
   * Initialize tasks.
   */

  // Register a custom "build" task.
  shipit.registerTask('build', 'Build project', function () {
    shipit.local('cd ' + shipit.config.deployTo + ' && grunt', this.async());
  });

  // Register a "remote:build" task
  shipit.registerTask('remote:build', function () {
    shipit.remote('npm prune && npm rebuild', this.async());
  });

  // Register a "remote:restart" task.
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
    shipit.runTask('remote:build');
  });

  shipit.on('finished', function (next) {
    shipit.runTask('remote:restart', next);
  });
};