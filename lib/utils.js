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
  return str.replace(/[\n\r]/g, '\n' + prefix);
}

/**
 * Empty function.
 */

function noop() {}