/**
 * Module dependencies.
 */

var grunt = require('grunt');
var sinon = require('sinon');

/**
 * Expose methods.
 */

exports.silent = silent;
exports.restore = restore;

/**
 * Silent grunt log.
 */

function silent() {
  sinon.stub(grunt.log, 'writeln');
  sinon.stub(grunt.log, 'ok');
}

/**
 * Restore grunt log.
 */

function restore() {
  grunt.log.writeln.restore();
  grunt.log.ok.restore();
}