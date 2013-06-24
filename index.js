"use strict"

var fork = require('child_process').fork
var fs = require('fs')
var domain = require('domain')

module.exports = Slacker

/**
 * Create a Slacker instance for `service`.
 *
 * @param {String} service commandline path and arguments to run.
 * @return {Slacker}
 * @api public
 */

function Slacker(service) {
  if (!(this instanceof Slacker)) return new Slacker(service)
  this._service = service
  this._timeout = 10000
}

/**
 * Close down the service after `timeout` if
 * there are no active connections.
 *
 * @param {Number} value timeout in milliseconds.
 * @return {Slacker}
 * @api public
 */

Slacker.prototype.timeout = function(value) {
  this._timeout = parseInt(value, 10)
  return this
}

/**
 * Start listening on `port`. Calls `fn` when listening.
 *
 * @param {Number} port
 * @param {Function} fn
 * @return {Slacker}
 * @api public
 */

Slacker.prototype.listen = function(port, fn) {
  if (typeof port === 'function') {
    fn = port
    port = null
  }
  this._port = port = port || 0
  fn = fn || function() {}
  // here we go
  spawn(this, fn)
  return this
}

/**
 * Kill the slacker. Disconnects everything.
 *
 * @api public
 */
Slacker.prototype.close = function() {
  this._isClosed = true
  this._child && this._child.disconnect()
}

// TODO: tidy this
function spawn(parent, fn) {
  var port = parent._port
  var timeout = parent._timeout
  var args = parent._service
  parent._child = undefined

  domain
  .create()
  .on('error', function onError(err) {
    console.error(err)
    parent._child && parent._child.kill()
    process.exit(1)
  })
  .run(function spawnProcess() {
    var cmd = args.split(' ')[0]
    fs.exists(cmd, function(exists) {
      if (parent._isClosed) return
      if (!exists) return fn(new Error('command not found: ' + cmd))
      parent._child = fork(__dirname + '/bin/spawn', [port, timeout].concat(args), {env: process.env})
      .on('message', function onMessage(msg) {
        if (parent._isClosed) return
        if (port && msg != port) return
        this.removeListener('listening', onMessage)
        fn(null, parseInt(msg, 10))
      })

      process.once('exit', function() {
        parent.close()
      })
    })
  })
}
