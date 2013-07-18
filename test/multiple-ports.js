var assert = require('assert')
var cluster = require('cluster')
var request = require('request')
var test = require('tape')
var slacker = require('../')

test('connections to different services', function(t) {
  t.plan(6)

  var A = slacker(__dirname + '/fixtures/server.js A')
  .timeout(100)
  .listen(7092, function() {
    request('http://localhost:7092', function(err, res) {
      t.ifError(err)
      t.equal(res.statusCode, 200)
      t.equal(res.body, 'A')
      A.close()
    })
  })

  var B = slacker(__dirname + '/fixtures/server.js B')
  .timeout(100)
  .listen(7093, function() {
    request('http://localhost:7093', function(err, res) {
      t.ifError(err)
      t.equal(res.statusCode, 200)
      t.equal(res.body, 'B')
      B.close()
    })
  })
})
