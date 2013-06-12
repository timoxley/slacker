var assert = require('assert')
var cluster = require('cluster')
var request = require('request')
var test = require('tape')
var onDemand = require('../')

test('connections to different services', function(t) {
  t.plan(6)

  var A = onDemand(7090)
  .timeout(100)
  .spawn(__dirname + '/fixtures/server.js A', function() {
    request('http://localhost:7090', function(err, res) {
      t.ifError(err)
      t.equal(res.statusCode, 200)
      t.equal(res.body, 'A')
      A.close()
    })
  })

  var B = onDemand(7091)
  .timeout(100)
  .spawn(__dirname + '/fixtures/server.js B', function() {
    request('http://localhost:7091', function(err, res) {
      t.ifError(err)
      t.equal(res.statusCode, 200)
      t.equal(res.body, 'B')
      B.close()
    })
  })
})
