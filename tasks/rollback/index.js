/**
 * Rollback task.
 * - rollback:init
 * - deploy:publish
 * - deploy:clean
 */

module.exports = function (grunt) {
  grunt.registerTask('rollback', [
    'rollback:init',
    'deploy:publish',
    'deploy:clean'
  ]);
};