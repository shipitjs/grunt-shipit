/**
 * Module dependencies.
 */

var util = require('util');

/**
 * Expose methods.
 */

exports.join = join;

exports.sep = '/';

/**
 * Inherits from Node.js path module
 * @see https://github.com/joyent/node/blob/master/lib/path.js
 */

function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

/**
 * Inherits from Node.js posix path.normalize
 * @see https://github.com/joyent/node/blob/master/lib/path.js
 */

function normalize(path) {
  var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.substr(-1) === '/';

  // Normalize the path
  path = normalizeArray(path.split('/').filter(function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
}

/**
 * Inherits from Node.js posix path.join
 * @see https://github.com/joyent/node/blob/master/lib/path.js
 */

function join() {
  var path = '';
  for (var i = 0; i < arguments.length; i++) {
    var segment = arguments[i];
    if (typeof segment !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    if (segment) {
      if (!path) {
        path += segment;
      } else {
        path += '/' + segment;
      }
    }
  }
  return normalize(path);
}
