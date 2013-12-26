/**
 * Module dependencies.
 */

var Shipit = require('../lib/shipit');

/**
 * Expose task.
 */

module.exports = shipitTask;

/**
 * Shipit task.
 */

function shipitTask(grunt) {
  'use strict';

  // Init shipit
  grunt.shipit = new Shipit();

  grunt.loadTasks('tasks/deploy');
  grunt.loadTasks('tasks/rollback');

  grunt.registerTask('shipit', 'Shipit Task', function (stage) {
    var config = grunt.config.get('shipit');

    grunt.shipit.stage = stage;
    grunt.shipit
      .initConfig(config)
      .initialize();
  });
}