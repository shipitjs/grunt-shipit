/**
 * Module dependencies.
 */

var async = require('async');

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
  this.connections = connections;
}

/**
 * Run a command on the connection pool.
 *
 * @param {String} command
 * @param {Function} callback
 */

ConnectionPool.prototype.run = function (command, callback) {
  var runners = this.connections.map(function (connection) {
    return connection.run.bind(connection, command);
  });
  async.parallel(runners, callback);
};