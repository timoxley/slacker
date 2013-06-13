var assert = require('assert')
var cluster = require('cluster')
var request = require('request')
var test = require('tape')
var slacker = require('../')

test('http connections', function(t) {
  t.plan(3)

  var service = slacker(__dirname + '/fixtures/server.js')
  .timeout(100)
  .listen(7090, function() {
    request('http://localhost:7090', function(err, res) {
      t.ifError(err)
      t.equal(res.statusCode, 200)
      t.equal(res.body, 'success')
      service.close()
    })
  })
})
