var assert = require('assert')
var cluster = require('cluster')
var request = require('request')
var test = require('tape')
var onDemand = require('../')

test('errors on startup if file does not exist', function(t) {
  t.plan(1)

  var A = onDemand(7090)
  .timeout(100)
  .spawn(__dirname + '/fixtures/DOESNOTEXIST.js', function(err) {
    t.ok(err)
    A.close()
  })
})

