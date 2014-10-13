/**
 * Module dependencies.
 */

var isFunction = require('lodash').isFunction;
var isString = require('lodash').isString;
var defaults = require('lodash').defaults;
var remote = require('./remote');
var childProcess = require('child_process');
var LineWrapper = require('stream-line-wrapper');

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
  this.options = options || {};
  this.remote = isString(this.options.remote) ? remote.parse(this.options.remote) : this.options.remote;
}

/**
 * Run a new SSH command.
 *
 * @param {String} command
 * @param {Object} options
 * @param {Function} cb
 * @returns {ChildObject}
 */

Connection.prototype.run = function (command, options, cb) {
  // run(command, cb)
  if (isFunction(options)) {
    cb = options;
    options = undefined;
  }

  options = defaults(options || {}, {
    maxBuffer: 1000 * 1024
  });

  this.options.logger.log('Running "%s" on host "%s".', command, this.remote.host);

  // In sudo mode, we use a TTY channel.
  var args = /^sudo/.exec(command) ? ['-tt'] : [];
  args.push('-p ' + (this.options.port || 22));
  args.push(remote.format(this.remote));

  // Escape double quotes in command.
  command = command.replace(/"/g, '\\"');

  // Complete arguments.
  args = ['ssh'].concat(args).concat(['"' + command + '"']);

  // Log wrappers.
  var stdoutWrapper = new LineWrapper({ prefix: '@' + this.remote.host + ' ' });
  var stderrWrapper = new LineWrapper({ prefix: '@' + this.remote.host + ' ' });

  // Exec command.
  var child = childProcess.exec(args.join(' '), options, function(err, stdout) { cb(err, stdout); });
  if (this.options.stdout) child.stdout.pipe(stdoutWrapper).pipe(this.options.stdout);
  if (this.options.stderr) child.stderr.pipe(stderrWrapper).pipe(this.options.stderr);

  return child;
};

/**
 * Remote file copy.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Object} options
 * @param {Function} cb
 * @returns {ChildObject}
 */

Connection.prototype.copy = function (src, dest, options, cb) {
  // function (src, dest, cb)
  if (isFunction(options)) {
    cb = options;
    options = {};
  }

  options = defaults(options || {}, {
    maxBuffer: 1000 * 1024
  });

  // Complete dest.
  dest = remote.format(this.remote) + ':' + dest;

  // Format excludes.
  var excludes = options.ignores ? formatExcludes(options.ignores) : [];

  // Build command.
  var args = ['rsync'].concat(excludes).concat([
    '-az',
    '-e',
    '"ssh -p ' + (this.options.port || 22) + '"',
    src,
    dest
  ]);

  this.options.logger.log('Remote copy "%s" to "%s"', src, dest);

  // Log wrappers.
  var wrapper = new LineWrapper({ prefix: '@' + this.remote.host + ' ' });
  var errorWrapper = new LineWrapper({ prefix: '@' + this.remote.host + '-err ' });

  // Exec command.
  var child = childProcess.exec(args.join(' '), options, cb);
  if (this.options.stdout) child.stdout.pipe(wrapper).pipe(this.options.stdout);
  if (this.options.stderr) child.stderr.pipe(errorWrapper).pipe(this.options.stderr);

  return child;
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
