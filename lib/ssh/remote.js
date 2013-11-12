/**
 * Expose methods.
 */

exports.parse = parse;
exports.format = format;

/**
 * Parse a remote string.
 *
 * @param {String} str
 * @return {Object.<String>} remote object
 */

function parse(str) {
  var matches = str.match(/(.*)@(.*)/);
  if (! matches) return { user: 'deploy', host: str };
  return { user: matches[1], host: matches[2] };
}

/**
 * Format a remote object.
 *
 * @param {Object.<String>} remote object
 * @return {String}
 */

function format(obj) {
  return obj.user + '@' + obj.host;
}