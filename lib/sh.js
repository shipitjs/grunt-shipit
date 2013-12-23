/**
 * Module dependencies.
 */

var isFunction = require('lodash').isFunction;
var extend = require('lodash').extend;
var cmd = require('./command');

/**
 * Expose functions.
 */

exports.run = run;

/**
 * Run a new command.
 *
 * @param {String} command
 * @param {String[]} args
 * @param {Object} options
 * @param {Function} callback
 */

function run(command, args, options, callback) {
  // run(command, callback)
  if (isFunction(args)) {
    callback = args;
    args = [];
  }

  // run(command, args, callback)
  if (isFunction(options)) {
    callback = options;
    options = undefined;
  }

  console.log('Running "%s" locally.', command);

  args.unshift(command);
  args.unshift('-c');

  options = extend(options || {}, { logPrefix: '@ ' });

  cmd.spawn('/bin/sh', args, options, callback);
}