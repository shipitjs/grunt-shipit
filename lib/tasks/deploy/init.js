/**
 * Init task.
 * - Emit deploy event.
 */

module.exports = function (shipit) {
  shipit.registerTask('deploy:init', function () {
    shipit.emit('deploy');
  });
};