/**
 * Module dependencies.
 */

var isFunction = require('lodash').isFunction;
var extend = require('lodash').extend;
var remote = require('./remote');
var cmd = require('../command');

/**
 * Expose connection
 */

module.exports = Connection;

/**
 * Initialize a new `Connection` with `options`.
 *
 * @param {Object|String} options
 */

function Connection(options) {
  if (typeof options === 'string') this.config = remote.parse(options);
  else this.config = options;

  this.remote = remote.format(this.config);
}

/**
 * Run a new SSH command.
 *
 * @param {String} command
 * @param {String[]} args
 * @param {Object} options
 * @return {connection} for chaining
 */

Connection.prototype.run = function (command, args, options, callback) {
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

  console.log('Running "%s" on host "%s".', command, this.config.host);

  args.unshift(command);

  args.unshift(this.remote);

  if (/^sudo/.exec(command))
    args.unshift('-tt');

  options = extend(options || {}, { logPrefix: '@' + this.config.host + ' ' });

  cmd.spawn('ssh', args, options, callback);

  return this;
};

/**
 * Remote file copy.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Object} options
 * @param {Function} callback
 * @return {connection} for chaining
 */

Connection.prototype.copy = function (src, dest, options, callback) {
  // function (src, dest, callback)
  if (isFunction(options)) {
    callback = options;
    options = {};
  }

  // Complete dest.
  dest = this.remote + ':' + dest;

  // Format excludes.
  var excludes = options.ignores ? formatExcludes(options.ignores) : [];

  // Build command.
  var args = excludes.concat([
    '-az',
    '-e',
    'ssh',
    src,
    dest
  ]);

  console.log('Remote copy "%s" to "%s"', src, dest);

  // Spawn command.
  cmd.spawn('rsync', args, { logPrefix: '@' + this.config.host + ' '}, callback);
};

/**
 * Format excludes to rsync excludes.
 *
 * @param {String[]} excludes
 * @returns {String[]}
 */

function formatExcludes(excludes) {
  return excludes.reduce(function (prev, current) {
    return prev.concat(['--exclude', current]);
  }, []);
}