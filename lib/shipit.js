/**
 * Module dependencies.
 */

var util = require('util');
var events = require('events');
var isArray = require('lodash').isArray;
var defaults = require('lodash').defaults;
var extend = require('lodash').extend;
var defaults = require('lodash').defaults;
var childProcess = require('child_process');
var ConnectionPool = require('./ssh/connection-pool');
var LineWrapper = require('stream-line-wrapper');

/**
 * Expose shipit.
 */

module.exports = Shipit;

/**
 * Initialize a new `Shipit`.
 */

function Shipit(options) {
  this.options = defaults(options || {}, {
    stdout: process.stdout,
    stderr: process.stderr,
    logger: console
  });

  if (this.options.stdout === process.stdout)
    process.stdout.setMaxListeners(100);

  if (this.options.stderr === process.stderr)
    process.stderr.setMaxListeners(100);

  // Inherits from EventEmitter
  events.EventEmitter.call(this);
}

/**
 * Inherits from EventEmitter.
 */

util.inherits(Shipit, events.EventEmitter);

/**
 * Initialize the `shipit`.
 *
 * @returns {shipit} for chaining
 */

Shipit.prototype.initialize = function () {
  return this.initSshPool();
};

/**
 * Initialize SSH connections.
 *
 * @returns {shipit} for chaining
 */

Shipit.prototype.initSshPool = function () {
  var servers = isArray(this.config.servers) ? this.config.servers : [this.config.servers];
  this.sshPool = new ConnectionPool(servers, this.options);
  return this;
};

/**
 * Initialize shipit configuration.
 *
 * @param {Object} config
 * @returns {shipit} for chaining
 */

Shipit.prototype.initConfig = function (config) {
  this.config = extend({
    branch: 'master',
    keepReleases: 5
  }, config.options, config[this.stage]);
  return this;
};

/**
 * Run a command locally.
 *
 * @param {String} command
 * @param {Object} options
 * @param {Function} cb
 * @returns {ChildObject}
 */

Shipit.prototype.local = function (command, options, cb) {
  options = defaults(options || {}, {
    maxBuffer: 1000 * 1024
  });

  var stdoutWrapper = new LineWrapper({ prefix: '@ ' });
  var stderrWrapper = new LineWrapper({ prefix: '@ ' });
  var child = childProcess.exec(command, options, cb);
  if (this.options.stdout) child.stdout.pipe(stdoutWrapper).pipe(this.options.stdout);
  if (this.options.stderr) child.stderr.pipe(stderrWrapper).pipe(this.options.stderr);
  return child;
};

/**
 * Run a command remotely.
 *
 * @param {String} command
 * @param {Object} options
 * @param {Function} cb
 * @returns {ChildObject}
 */

Shipit.prototype.remote = function (command, options, cb) {
  return this.sshPool.run(command, options, cb);
};

/**
 * Copy from local to remote.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Function} callback
 * @returns {ChildObject}
 */

Shipit.prototype.remoteCopy = function (src, dest, callback) {
  var ignores = this.config && this.config.ignores ? this.config.ignores : [];
  return this.sshPool.copy(src, dest, { ignores: ignores }, callback);
};