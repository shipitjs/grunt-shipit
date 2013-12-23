/**
 * Module dependencies.
 */

var initTask = require('./init');
var publishTask = require('../deploy/publish');
var cleanTask = require('../deploy/clean');

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
  publishTask(shipit);
  cleanTask(shipit);

  shipit.registerTask('rollback', [
    'shipit:rollback:init',
    'shipit:deploy:publish',
    'shipit:deploy:clean'
  ]);
};