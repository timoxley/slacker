"use strict"

var cluster = require('cluster')
var request = require('request')
var test = require('tape')
var slacker = require('../')
var exec = require('child_process').exec

test('process is set to slacker-process-name', function(t) {
  t.plan(2)

  var service = slacker(__dirname + '/fixtures/server.js')
  .timeout(100)
  .listen(7090, function() {
    exec('ps aux | pgrep -f slacker-server.js', function(err, stdout) {
      t.ifError(err, 'no error')
      t.ok(parseInt(stdout) == stdout, 'stdout is a process number')
      service.end()
    })
  })
})

