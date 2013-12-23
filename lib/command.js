/**
 * Module dependencies.
 */

var childProcess = require('child_process');
var defaults = require('lodash').defaults;
var omit = require('lodash').omit;
var utils = require('./utils');
var nodeUtil = require('util');

/**
 * Expose functions.
 */

exports.spawn = spawn;

/**
 * Spawn a new command.
 *
 * @param {String} command
 * @param {String[]} args
 * @param {Object} options
 * @param {Function} callback
 */

function spawn(command, args, options, callback) {
  args = args || [];
  options = defaults(options || {}, { logPrefix: '' });

  console.log('=> %s', command + ' ' + args.join(' '));

  var childProcObj = childProcess.spawn(command, args, omit(options, 'logPrefix'));
  var stdout = '';

  // Handle stderr.
  childProcObj.stderr.on('data', function (data) {
    console.error(utils.prefixLines(options.logPrefix, data.toString()));
  }.bind(this));

  // Handle stdout.
  childProcObj.stdout.on('data', function (data) {
    console.log(utils.prefixLines(options.logPrefix, data.toString()));
    stdout += data.toString();
  }.bind(this));

  childProcObj.on('error', function () {
    // Deferred error to take time to read stderr.
    setTimeout(callback, 0);
  });

  // Handle close event.
  childProcObj.on('close', function (code) {
    // Return an error if code is not 0
    if (code !== 0) {
      var errorMsg = nodeUtil.format('Error (exit code %d) running command "%s".', code, command);
      var error = new Error(errorMsg);
      error.code = code;
      return callback(error);
    }

    console.log('Finished %s.', command);
    callback(null, stdout);
  }.bind(this));
}