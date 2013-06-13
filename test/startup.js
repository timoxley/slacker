var assert = require('assert')
var cluster = require('cluster')
var request = require('request')
var test = require('tape')
var slacker = require('../')

test('errors on startup if file does not exist', function(t) {
  t.plan(1)

  var A = slacker(__dirname + '/fixtures/DOESNOTEXIST.js')
  .timeout(100)
  .listen(0, function(err) {
    t.ok(err)
    A.close()
  })
})

