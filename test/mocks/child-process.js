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

childProcess.exec = sinon.spy(function (command, options, cb) {
  this.child = new EventEmitter();
  this.child.stderr = new EventEmitter();
  this.child.stdout = new EventEmitter();

  process.nextTick(function() { cb(null, 'stdout', 'stderr')});
  return this.child;
});

/**
 * Restore mock.
 */

childProcess.restore = function () {
  this.exec.reset();
};