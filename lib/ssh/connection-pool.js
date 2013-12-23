/**
 * Module dependencies.
 */

var isFunction = require('lodash').isFunction;
var async = require('async');
var Connection = require('./connection');

/**
 * Expose ConnectionPool.
 */

module.exports = ConnectionPool;

/**
 * Initialize a new `ConnectionPool` with `connections`.
 *
 * @param {Array} connections
 */

function ConnectionPool(connections) {
  // Create connection if necessary.
  connections = connections.map(function (connection) {
    if (connection instanceof Connection) return connection;
    return new Connection(connection);
  });

  this.connections = connections;
}

/**
 * Run a command on each connection.
 *
 * @param {String} command
 * @param {String[]} args
 * @param {Object} options
 * @param {Function} callback
 * @return {connection} for chaining
 */

ConnectionPool.prototype.run = function (command, args, options, callback) {
  // run(command, callback)
  if (isFunction(args)) {
    callback = args;
    args = [];
  }

  // run(command, args, callback)
  if (isFunction(options)) {
    callback = options;
    options = undefined;
  }

  var runners = this.connections.map(function (connection) {
    return connection.run.bind(connection, command, args, options);
  });
  async.parallel(runners, callback);
};

/**
 * Remote copy on each connection.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Object} options
 * @param {Function} callback
 */

ConnectionPool.prototype.copy = function (src, dest, options, callback) {
  // function (src, dest, callback)
  if (isFunction(options)) {
    callback = options;
    options = {};
  }

  var runners = this.connections.map(function (connection) {
    return connection.copy.bind(connection, src, dest, options);
  });

  async.parallel(runners, callback);
};