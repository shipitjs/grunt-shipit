/**
 * Module dependencies.
 */

var isFunction = require('lodash').isFunction;
var remote = require('./remote');
var utils = require('../utils');
var sh = require('../sh');

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
 * Spawn a new SSH process.
 *
 * @param {String} command
 * @return {ChildProcessObject}
 */

Connection.prototype.spawn = function (command) {
  return sh.spawn('ssh', ['-tt', this.remote, command]);
};

/**
 * Run a new SSH command.
 *
 * @param {String} command
 * @param {Function} callback
 * @return {connection} for chaining
 */

Connection.prototype.run = function (command, callback) {
  console.log('Running ' + command + ' on ' + this.config.host);

  var childProcObj = this.spawn(command);
  var stdout = '';

  // Handle stderr.
  childProcObj.stderr.on('data', function (data) {
    console.error(utils.prefixLines('@' + this.config.host + ' ', data.toString()));
  }.bind(this));

  // Handle stdout.
  childProcObj.stdout.on('data', function (data) {
    console.log(utils.prefixLines('@' + this.config.host + ' ', data.toString()));
    stdout += data.toString();
  }.bind(this));

  // Handle close event.
  childProcObj.on('close', function (code) {
    // Return an error if code is not 0
    if (code !== 0) {
      var error = new Error('Error (exit code ' + code + ') running command ' + command +
          ' on ' + this.config.host);
      error.code = code;
      return callback(error);
    }

    console.log('Finished ' + command + ' on ' + this.config.host);
    callback(null, stdout);
  }.bind(this));

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
  var scp = sh.spawn('rsync', args);

  // Handle stdout.
  scp.stdout.on('data', function (data) {
    console.log(utils.prefixLines('@' + this.config.host + ' ', data.toString()));
  }.bind(this));

  // Handle close event.
  scp.on('close', function (code) {
    // Return an error if code is not 0
    if (code !== 0)
      return callback(new Error('Error (exit code ' + code + ') running copy "' + src +
        '" to "' + dest + '"'));

    console.log('Finished copy "%s" to "%s"', src, dest);
    callback();
  }.bind(this));

  return this;
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