/**
 * Module dependencies.
 */

var isFunction = require('lodash').isFunction;
var extend = require('lodash').extend;
var async = require('async');
var Connection = require('./connection');
var extend = require('lodash').extend;

/**
 * Expose ConnectionPool.
 */

module.exports = ConnectionPool;

/**
 * Initialize a new `ConnectionPool` with `connections`.
 *
 * @param {Array} connections
 * @param {Object} options
 */

function ConnectionPool(connections, options) {
  // Create connection if necessary.
  connections = connections.map(function (connection) {
    if (connection instanceof Connection) return connection;

    var splitURL = connection.split(':');
    var port = 22;

    if (splitURL[1]) {
      connection = splitURL[0];
      port = splitURL[1];
    }

    options = extend(options || {}, {port: port});
    return new Connection(extend({ remote: connection }, options));
  });

  this.connections = connections;
}

/**
 * Run a command on each connection.
 *
 * @param {String} command
 * @param {Object} options
 * @param {Function} cb
 * @return {connection} for chaining
 */

ConnectionPool.prototype.run = function (command, options, cb) {
  // run(command, cb)
  if (isFunction(options)) {
    cb = options;
    options = undefined;
  }

  var runners = this.connections.map(function (connection) {
    return connection.run.bind(connection, command, options);
  });

  async.parallel(runners, cb);
};

/**
 * Remote copy on each connection.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Object} options
 * @param {Function} cb
 */

ConnectionPool.prototype.copy = function (src, dest, options, cb) {
  // function (src, dest, cb)
  if (isFunction(options)) {
    cb = options;
    options = undefined;
  }

  var runners = this.connections.map(function (connection) {
    return connection.copy.bind(connection, src, dest, options);
  });

  async.parallel(runners, cb);
};