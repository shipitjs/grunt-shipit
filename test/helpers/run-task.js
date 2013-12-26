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
 * @param {String} task
 * @param {Function} cb
 */

function runTask(task, cb) {
  cb = once(cb);

  grunt.task.options({
    done: cb,
    error: cb
  });

  grunt.task.run([task]);
  grunt.task.start();
}