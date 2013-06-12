var assert = require('assert')
var cluster = require('cluster')
var request = require('request')
var test = require('tape')
var onDemand = require('../')

test('port assignment', function(t) {
  t.plan(2)

  var service1 = onDemand(7090)
  .timeout(100)
  .spawn(__dirname + '/fixtures/server.js', function(err, port) {
    t.ifError(err)
    t.equal(port, 7090)
    service1.close()
  })
})

test('random port assignment', function(t) {
  t.plan(3)
  var service2 = onDemand(0)
  .timeout(100)
  .spawn(__dirname + '/fixtures/server.js', function(err, port) {
    t.ifError(err)
    t.ok(port)
    t.equal(typeof port, 'number')
    service2.close()
  })
})

test('random port assignment with no port argument', function(t) {
  t.plan(3)
  var service3 = onDemand()
  .timeout(100)
  .spawn(__dirname + '/fixtures/server.js', function(err, port) {
    t.ifError(err)
    t.ok(port)
    t.equal(typeof port, 'number')
    service3.close()
  })
})

