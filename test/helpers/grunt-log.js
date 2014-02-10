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
  sinon.stub(grunt.log, 'header');
}

/**
 * Restore grunt log.
 */

function restore() {
  grunt.log.writeln.restore();
  grunt.log.ok.restore();
  grunt.log.header.restore();
}