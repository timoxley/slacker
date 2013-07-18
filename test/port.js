var assert = require('assert')
var cluster = require('cluster')
var request = require('request')
var test = require('tape')
var slacker = require('../')

test('port assignment', function(t) {
  t.plan(2)

  var service1 = slacker(__dirname + '/fixtures/server.js')
  .timeout(100)
  .listen(7094, function(err, port) {
    t.ifError(err)
    t.equal(port, 7090)
    service1.close()
  })
})

test('random port assignment with port 0', function(t) {
  t.plan(3)
  var service2 = slacker(__dirname + '/fixtures/server.js')
  .timeout(100)
  .listen(0, function(err, port) {
    t.ifError(err)
    t.ok(port)
    t.equal(typeof port, 'number')
    service2.close()
  })
})

test('random port assignment with no port argument', function(t) {
  t.plan(3)
  var service3 = slacker(__dirname + '/fixtures/server.js')
  .timeout(100)
  .listen(function(err, port) {
    t.ifError(err)
    t.ok(port)
    t.equal(typeof port, 'number')
    service3.close()
  })
})

