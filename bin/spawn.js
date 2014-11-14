#!/usr/bin/env node

var minimist = require('minimist')

var argv = minimist(process.argv.slice(2), {
  '--': true
})

require('../spawner')({
  port: argv.port,
  timeout: argv.timeout,
  start: argv.start,
  daemon: argv.daemon,
  minConnections: argv.minConnections,
  args: argv['--']
})
