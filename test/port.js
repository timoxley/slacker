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
    t.equal(port, 7094)
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


test('fixed port on service', function(t) {
  var service3 = slacker(__dirname + '/fixtures/server-port.js 8009')
  .timeout(10000)
  .start()
  .listen(function(err, port) {
    t.ifError(err)
    t.ok(port)
    t.equal(typeof port, 'number')
    t.equal(typeof port, 'number')
    request.get('http://localhost:8009', function(err, res, body) {
      t.ifError(err)
      t.equal(res.statusCode, 200)
      t.equal(body.trim(), 'success')
      t.end()
      service3.close()
    })
  })
})
