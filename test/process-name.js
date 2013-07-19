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
    exec('pgrep -fl "slacker: server.js"', function(err, stdout) {
      t.ifError(err, 'no error')
      // might print 2 lines, one being the pgrep proc
      stdout = stdout+'\n'
      stdout.split('\n').forEach(function(proc) {
        if (!proc) return
        var name = proc.split(' ')[1] // 1 is process name
        if (name && name.match(/^slacker/)) {
          t.notEqual(proc.indexOf('slacker: server.js'), -1)
        }
      })
      service.end()
    })
  })
})

test('process title includes arguments ', function(t) {
  t.plan(2)

  var service = slacker(__dirname + '/fixtures/server.js --help')
  .timeout(100)
  .listen(7096, function() {
    exec('pgrep -fl "slacker: server.js --help"', function(err, stdout) {
      t.ifError(err, 'no error')
      // might print 2 lines, one being the pgrep proc
      stdout = stdout+'\n'
      stdout.split('\n').forEach(function(proc) {
        if (!proc) return
        var name = proc.split(' ')[1] // 1 is process name
        if (name && name.match(/^slacker/)) {
          t.notEqual(proc.indexOf('slacker: server.js --help'), -1)
        }
      })
      service.end()
    })
  })
})

