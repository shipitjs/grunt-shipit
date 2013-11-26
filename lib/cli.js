/**
 * Module dependencies.
 */

var program = require('commander');
var rest = require('lodash').rest;
var pkg = require('../package.json');
var Shipit = require('./shipit');

/**
 * Program.
 */

program
  .version(pkg.version)
  .usage('<stage> <tasks ...>')
  .parse(process.argv);

/**
 * Parse program arguments.
 */

var stage = program.args[0],
  tasks = rest(program.args);

// Stage is required
if (! stage) return program.help();

// Use deploy as default tasks
if (! tasks.length) tasks.push('deploy');

/**
 * Create and start shipit.
 */

(new Shipit(stage))
  .initialize()
  .runTask(tasks);