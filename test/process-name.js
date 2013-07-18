"use strict"

var cluster = require('cluster')
var request = require('request')
var test = require('tape')
var slacker = require('../')
var exec = require('child_process').exec

test('process is set to slacker: process-name', function(t) {
  t.plan(2)

  var service = slacker(__dirname + '/fixtures/server.js')
  .timeout(100)
  .listen(7095, function() {
    exec('ps aux | pgrep -f "slacker: server.js"', function(err, stdout) {
      t.ifError(err, 'no error')
      t.equal(parseInt(stdout), stdout, 'stdout is a process number: ' + parseInt(stdout))
      service.end()
    })
  })
})

test('process title includes arguments ', function(t) {
  t.plan(2)

  var service = slacker(__dirname + '/fixtures/server.js --help')
  .timeout(100)
  .listen(7096, function() {
    exec('ps aux | pgrep -f "slacker: server.js --help"', function(err, stdout) {
      t.ifError(err, 'no error')
      t.equal(parseInt(stdout), stdout, 'stdout is a process number: ' + parseInt(stdout))
      service.end()
    })
  })
})

