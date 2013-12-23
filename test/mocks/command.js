/**
 * Module dependencies.
 */

var sinon = require('sinon');

/**
 * Define and expose module.
 */

var command = module.exports = {};

/**
 * Spawn.
 */

command.spawn = sinon.stub().yields();

/**
 * Restore mock.
 */

command.restore = function () {
  command.spawn.reset();
};