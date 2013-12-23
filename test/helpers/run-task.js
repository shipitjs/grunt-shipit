/**
 * Module dependencies.
 */

var grunt = require('grunt');
var once = require('lodash').once;

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
  cb = once(cb);

  grunt.task.options({
    done: cb,
    error: cb
  });

  shipit.runTask(task);
}