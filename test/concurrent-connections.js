var assert = require('assert')
var cluster = require('cluster')
var request = require('request')
var test = require('tape')
var onDemand = require('../')

test('concurrent http connections', function(t) {
  t.plan(6)

  var service = onDemand(7090)
  .timeout(100)
  .spawn(__dirname + '/fixtures/server.js', function() {
    request('http://localhost:7090', function(err, res) {
      t.ifError(err)
      t.equal(res.statusCode, 200)
      t.equal(res.body, 'success')
    })
    request('http://localhost:7090', function(err, res) {
      t.ifError(err)
      t.equal(res.statusCode, 200)
      t.equal(res.body, 'success')
    })
  })
  setTimeout(function() {
    service.close()
  }, 300)
})

