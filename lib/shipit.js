/**
 * Module dependencies.
 */

var util = require('util');
var events = require('events');
var isArray = require('lodash').isArray;
var extend = require('lodash').extend;
var sh = require('./sh');
var ConnectionPool = require('./ssh/connection-pool');

/**
 * Expose shipit.
 */

module.exports = Shipit;

/**
 * Initialize a new `Shipit`.
 */

function Shipit() {
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
  this.sshPool = new ConnectionPool(servers);
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
 * @param {String[]} args
 * @param {Object} options
 * @param {Function} callback
 * @returns {shipit} for chaining
 */

Shipit.prototype.local = function (command, args, options, callback) {
  sh.run(command, args, options, callback);
  return this;
};

/**
 * Run a command remotely.
 *
 * @param {String} command
 * @param {String[]} args
 * @param {Object} options
 * @param {Function} callback
 * @returns {shipit} for chaining
 */

Shipit.prototype.remote = function (command, args, options, callback) {
  this.sshPool.run(command, args, options, callback);
  return this;
};

/**
 * Copy from local to remote.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Function} callback
 * @returns {shipit} for chaining
 */

Shipit.prototype.remoteCopy = function (src, dest, callback) {
  var ignores = this.config && this.config.ignores ? this.config.ignores : [];
  this.sshPool.copy(src, dest, { ignores: ignores }, callback);
  return this;
};