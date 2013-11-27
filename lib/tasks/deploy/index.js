/**
 * Module dependencies.
 */

var fetchTask = require('./fetch');
var updateTask = require('./update');
var publishTask = require('./publish');

/**
 * Deploy task.
 */

module.exports = function (shipit) {
  // Load tasks.
  fetchTask(shipit);
  updateTask(shipit);
  publishTask(shipit);

  shipit.registerTask('deploy', ['shipit:deploy:fetch', 'shipit:deploy:update', 'shipit:deploy:publish']);
};