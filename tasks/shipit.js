/**
 * Module dependencies.
 */

var path = require('path');
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

  grunt.loadTasks(path.join(__dirname, 'deploy'));
  grunt.loadTasks(path.join(__dirname, 'rollback'));

  grunt.registerTask('shipit', 'Shipit Task', function (stage) {
    var config = grunt.config.get('shipit');

    grunt.shipit.stage = stage;
    grunt.shipit
      .initConfig(config)
      .initialize();
  });
}