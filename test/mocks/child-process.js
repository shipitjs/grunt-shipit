/**
 * Module dependencies.
 */

var sinon = require('sinon');
var EventEmitter = require('events').EventEmitter;

/**
 * Define and expose module.
 */

var childProcess = module.exports = {};

/**
 * Spawn.
 */

childProcess.spawn = sinon.spy(function () {
  this.child = new EventEmitter();
  this.child.stderr = new EventEmitter();
  this.child.stdout = new EventEmitter();

  return this.child;
});

/**
 * Restore mock.
 */

childProcess.restore = function () {
  this.spawn.reset();
};