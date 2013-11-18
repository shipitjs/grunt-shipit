/**
 * Module dependencies.
 */

var childProcess = require('child_process'),
  utils = require('./utils');

/**
 * Expose functions.
 */

exports.spawn = spawn;
exports.run = run;

/**
 * Spawn a new command.
 *
 * @param {String} command
 * @return {ChildProcessObject}
 */

function spawn(command) {
  return childProcess.spawn(command);
}

/**
 * Run a new command.
 *
 * @param {String} command
 * @param {Function} callback
 * @return {connection} for chaining
 */

function run(command, callback) {
  var childProcObj = this.spawn(command);

  console.log('Running ' + command + ' locally.');

  // Handle stderr.
  childProcObj.stderr.on('data', function (data) {
    console.error(utils.prefixLines('@ ', data.toString()));
  }.bind(this));

  // Handle stdout.
  childProcObj.stdout.on('data', function (data) {
    console.log(utils.prefixLines('@ ', data.toString()));
  }.bind(this));

  // Handle close event.
  childProcObj.on('close', function (code) {
    // Return an error if code is not 0
    if (code !== 0)
      return callback(new Error('Error (exit code ' + code + ') running command ' + command +
          ' locally.'));

    console.log('Finished ' + command);
    callback();
  }.bind(this));

  return this;
}