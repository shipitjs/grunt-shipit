/**
 * Module dependencies.
 */

var fetchTask = require('./fetch');
var updateTask = require('./update');
var publishTask = require('./publish');
var cleanTask = require('./clean');

/**
 * Deploy task.
 * - deploy:fetch
 * - deploy:update
 * - deploy:publish
 * - deploy:clean
 */

module.exports = function (shipit) {
  // Load tasks.
  fetchTask(shipit);
  updateTask(shipit);
  publishTask(shipit);
  cleanTask(shipit);

  shipit.registerTask('deploy', [
    'shipit:deploy:fetch',
    'shipit:deploy:update',
    'shipit:deploy:publish',
    'shipit:deploy:clean'
  ]);
};