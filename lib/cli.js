/**
 * Module dependencies.
 */

var pkg = require('../package.json'),
  program = require('commander'),
  _ = require('lodash'),
  Shipit = require('./shipit');

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
  tasks = _.rest(program.args);

// Stage is required
if (! stage) return program.help();

// Use deploy as default tasks
if (! tasks.length) tasks.push('deploy');

/**
 * Create and start shipit.
 */

var shipit = new Shipit(stage);
shipit.runTasks(tasks);