module.exports = function (shipit) {
  /**
   * Initialize config.
   */

  shipit.initConfig({
    buildDir: '/my/build/dir',
    repositoryUrl: '/my/repo/url',
    ignores: ['.git', 'node_modules'],
    stages: {
      development: 'dev.host.com',
      staging: ['staging1.host.com', 'staging2.host.com'],
      production: ['production1.host.com', 'production2.host.com']
    }
  });

  /**
   * Initialize tasks.
   */

  shipit.addTask('build', function (callback) {
    shipit.local('grunt', callback);
  });

  shipit.addTask('remote:install', function (callback) {
    shipit.remote('npm install', callback);
  });

  shipit.addTask('remote:restart', function (callback) {
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