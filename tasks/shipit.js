var Shipit = require('shipit-cli');

// Expose task.
module.exports = shipitTask;

/**
 * Shipit task.
 */

function shipitTask(grunt) {
  'use strict';

  // Init shipit
  grunt.shipit = new Shipit();

  grunt.registerTask('shipit', 'Shipit Task', function (env) {
    var config = grunt.config.get('shipit');

    grunt.shipit.environment = env;

    // Support legacy options.
    if (!config.default && config.options)
      config.default = config.options;

    grunt.shipit
      .initConfig(config)
      .initialize();
  });
}
