/**
 * Module dependencies.
 */

var grunt = require('grunt');

/**
 * Expose module.
 */

module.exports = runTask;

/**
 * Run task.
 *
 * @param {Shipit} shipit
 * @param {String} task
 * @param {Function} cb
 */

function runTask(shipit, task, cb) {
  grunt.task.options({
    done: cb,
    error: function (err) {
      throw err;
    }
  });

  shipit.runTask(task);
}