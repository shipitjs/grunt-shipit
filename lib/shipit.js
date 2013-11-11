/**
 * Module dependencies.
 */

var util = require('util'),
  events = require('events'),
  path = require('path'),
  async = require('async'),
  fs = require('fs'),
  utils = require('./utils');

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
  this.tasks = {};

  // Inherits from EventEmitter
  events.EventEmitter.call(this);

  // Initialize Shipfile
  this.init();
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

Shipit.prototype.init = function () {
  // Resolve Shipfile path.
  var file = path.resolve(process.cwd(), 'Shipfile.js');

  // Test if Shipfile exists.
  if (! fs.exists(file)) throw new Error('Can\'t find Shipfile.');

  // Run Shipfile module.
  require(file)(this);
};

/**
 * Initialize shipit configuration.
 *
 * @param {Object} config
 * @return {shipit} for chaining
 */

Shipit.prototype.initConfig = function (config) {
  this.config = config;
  return this;
};

/**
 * Add a task.
 *
 * @param {String} name
 * @param {Function} fn
 * @return {shipit} for chaining
 */

Shipit.prototype.addTask = function (name, fn) {
  this.tasks[name] = fn;
  return this;
};

/**
 * Run a task.
 *
 * @param {String} name
 * @param {Function} callback
 * @return {shipit} for chaining
 */

Shipit.prototype.runTask = function (name, callback) {
  callback = callback || utils.noop;
  this.tasks[name](callback);
  return this;
};

/**
 * Run several tasks.
 *
 * @param {Array.<String>} names
 * @return {shipit} for chaining
 */

Shipit.prototype.runTasks = function (names, callback) {
  async.every(names, this.runTask.bind(this), callback);
};