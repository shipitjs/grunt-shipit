/**
 * Module dependencies.
 */

var util = require('util');
var events = require('events');
var path = require('path');
var fs = require('fs');
var rest = require('lodash').rest;
var isArray = require('lodash').isArray;
var toArray = require('lodash').toArray;
var extend = require('lodash').extend;
var grunt = require('grunt');
var sh = require('./sh');
var ConnectionPool = require('./ssh/connection-pool');
var fetchTask = require('./tasks/fetch');
var updateTask = require('./tasks/update');
var publishTask = require('./tasks/publish');

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
}

/**
 * Inherits from EventEmitter.
 */

util.inherits(Shipit, events.EventEmitter);

/**
 * Initialize the `shipit`.
 *
 * @return {shipit} for chaining
 */

Shipit.prototype.initialize = function () {
  return this
    .initShipfile()
    .initSshPool()
    .initDeployTasks();
};

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
 *
 * @return {shipit} for chaining
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
 * @return {shipit} for chaining
 */

Shipit.prototype.initConfig = function (config) {
  this.config = extend({ branch: 'master' }, config.options, config[this.stage]);
  return this;
};

/**
 * Initialize deploy tasks.
 *
 * @return {shipit} for chaining
 */

Shipit.prototype.initDeployTasks = function () {
  fetchTask(this);
  updateTask(this);
  publishTask(this);

  return this;
};

/**
 * Add a task.
 *
 * @see http://gruntjs.com/api/grunt.task#grunt.task.registertask
 * @return {shipit} for chaining
 */

Shipit.prototype.registerTask = function () {
  var args = ['shipit:' + arguments[0]].concat(rest(arguments));
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
  var tasks = isArray(arguments[0]) ? arguments[0] : toArray(arguments);
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

/**
 * Copy from local to remote.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Function} callback
 * @return {shipit} for chaining
 */

Shipit.prototype.remoteCopy = function (src, dest, callback) {
  var ignores = this.config && this.config.ignores ? this.config.ignores : [];
  this.sshPool.copy(src, dest, { ignores: ignores }, callback);
  return this;
};