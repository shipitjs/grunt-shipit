/**
 * Module dependencies.
 */

var remote = require('./remote'),
  utils = require('../utils'),
  childProcess = require('child_process');

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
  return childProcess.spawn('ssh', [this.remote, command]);
};

/**
 * Run a new SSH command.
 *
 * @param {String} command
 * @param {Function} callback
 * @return {connection} for chaining
 */

Connection.prototype.run = function (command, callback) {
  var childProcObj = this.spawn(command);

  console.log('Running ' + command + ' on ' + this.config.host);

  // Handle stderr.
  childProcObj.stderr.on('data', function (data) {
    console.error(utils.prefixLines('@' + this.config.host + ' ', data.toString()));
  }.bind(this));

  // Handle stdout.
  childProcObj.stdout.on('data', function (data) {
    console.log(utils.prefixLines('@' + this.config.host + ' ', data.toString()));
  }.bind(this));

  // Handle close event.
  childProcObj.on('close', function (code) {
    // Return an error if code is not 0
    if (code !== 0)
      return callback(new Error('Error (exit code ' + code + ') running command ' + command +
          ' on ' + this.config.host));

    console.log('Finished ' + command + ' on ' + this.config.host);
    callback();
  }.bind(this));

  return this;
};

/**
 * Remote file copy.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Function} callback
 * @return {connection} for chaining
 */

Connection.prototype.copy = function (src, dest, callback) {
  dest = this.remote + ':' + dest;
  var scp = childProcess.spawn('scp', ['-r', src, dest]);

  console.log('Remote copy "%s" to "%s"', src, dest);

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