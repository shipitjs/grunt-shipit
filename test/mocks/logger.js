/**
 * Module dependencies.
 */

exports.log = log;
exports.flush = flush;

var logs = [];

/**
 * Log.
 */

function log(obj) {
  logs.push(obj);
}

/**
 * Flush logs.
 */

function flush() {
  var tmpLogs = logs;
  logs = [];
  return tmpLogs;
}