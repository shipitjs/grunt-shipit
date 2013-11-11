/**
 * Expose functions.
 */

exports.prefixLines = prefixLines;
exports.noop = noop;

/**
 * Prefix lines.
 * @param {String} prefix
 * @param {String} str
 * @return {String}
 */

function prefixLines(prefix, str) {
  return str.split('\n').map(function (line) {
    return prefix + line;
  }).join('\n');
}

/**
 * Empty function.
 */

function noop() {}