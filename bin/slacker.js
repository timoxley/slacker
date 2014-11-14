#!/usr/bin/env node

"use strict"

var path = require('path')
var Slacker = require('../')
var minimist = require('minimist')

var argv = minimist(process.argv.slice(2), {
  alias: {
    timeout: 't',
    port: 'p',
    service: 'c',
    start: 's',
    verbose: 'v',
    silent: 'shh'
  }
})

var timeout = argv.t
var port = argv.p
var start = argv.start
var verbose = argv.verbose
var silent = argv.silent

var service = argv.service
var serviceParts = argv.service.split(/\s+/)
var cmd = path.resolve(process.cwd(), serviceParts.shift())
service = [cmd].concat(serviceParts).join(' ')


var slacker = Slacker(service)

if (timeout) slacker.timeout(timeout)
if (start) slacker.start()
if (silent) slacker.silent()
if (verbose) slacker.verbose()
slacker.listen(port, function() {
  console.log(arguments)
})

