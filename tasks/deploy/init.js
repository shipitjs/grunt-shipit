/**
 * Init task.
 * - Emit deploy event.
 */

module.exports = function (grunt) {
  grunt.registerTask('deploy:init', function () {
    grunt.shipit.emit('deploy');
  });
};