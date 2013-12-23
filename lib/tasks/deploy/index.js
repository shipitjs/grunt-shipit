/**
 * Module dependencies.
 */

var initTask = require('./init');
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
  initTask(shipit);
  fetchTask(shipit);
  updateTask(shipit);
  publishTask(shipit);
  cleanTask(shipit);

  shipit.registerTask('deploy', [
    'shipit:deploy:init',
    'shipit:deploy:fetch',
    'shipit:deploy:update',
    'shipit:deploy:publish',
    'shipit:deploy:clean'
  ]);
};