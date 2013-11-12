/**
 * Module dependencies.
 */

var util = require('util'),
  events = require('events'),
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  grunt = require('grunt'),
  sh = require('./sh'),
  ConnectionPool = require('./ssh/connection-pool');

/**
 * Expose shipit.
 */

module.exports = Shipit;

/**
 * Initialize a new `Shipit`.
 *
 * @param {String} stage
 */

function Shipit(stage) {
  // Instance variables
  this.stage = stage;

  // Inherits from EventEmitter
  events.EventEmitter.call(this);

  // Initialize Shipfile
  this.initShipfile();

  // Initialize SSH Connection pool
  this.initSshPool();
}

/**
 * Inherits from EventEmitter.
 */

util.inherits(Shipit, events.EventEmitter);

/**
 * Initialize the `shipit` with the local Shipfile.js.
 *
 * @return {shipit} for chaining
 */

Shipit.prototype.initShipfile = function () {
  // Resolve Shipfile path.
  var file = path.resolve(process.cwd(), 'Shipfile.js');

  // Test if Shipfile exists.
  if (! fs.existsSync(file)) throw new Error('Can\'t find Shipfile.');

  // Run Shipfile module.
  require(file)(this);
  return this;
};

/**
 * Initialize SSH connections.
 */

Shipit.prototype.initSshPool = function () {
  var servers = _.isArray(this.config.servers) ? this.config.servers : [this.config.servers];
  this.sshPool = new ConnectionPool(servers);
};

/**
 * Initialize shipit configuration.
 *
 * @param {Object} config
 * @return {shipit} for chaining
 */

Shipit.prototype.initConfig = function (config) {
  this.config = _.extend({}, config.options, config[this.stage]);
  return this;
};

/**
 * Add a task.
 *
 * @see http://gruntjs.com/api/grunt.task#grunt.task.registertask
 * @return {shipit} for chaining
 */

Shipit.prototype.registerTask = function () {
  var args = ['shipit:' + arguments[0]].concat(_.rest(arguments));
  grunt.task.registerTask.apply(grunt.task, args);
  return this;
};

/**
 * Run one or several tasks.
 *
 * @see http://gruntjs.com/api/grunt.task#grunt.task.run
 * @return {shipit} for chaining
 */

Shipit.prototype.runTask = function () {
  var tasks = _.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments);
  tasks = tasks.map(function (task) {
    return 'shipit:' + task;
  });
  grunt.task.run(tasks);
  grunt.task.start();
  return this;
};

/**
 * Run a command locally.
 *
 * @param {String} command
 * @param {Function} callback
 * @return {shipit} for chaining
 */

Shipit.prototype.local = function (command, callback) {
  sh.run(command, callback);
  return this;
};

/**
 * Run a command remotely.
 *
 * @param {String} command
 * @param {Function} callback
 * @return {shipit} for chaining
 */

Shipit.prototype.remote = function (command, callback) {
  this.sshPool.run(command, callback);
  return this;
};