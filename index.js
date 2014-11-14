"use strict"


var fork = require('child_process').fork
var fs = require('fs')
var path = require('path')
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
  this._silent = true
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


Slacker.prototype.start = function() {
  this._doStart = true
  return this
}

Slacker.prototype.silent = function() {
  this._silent = true
  return this
}

Slacker.prototype.verbose = function() {
  this._silent = false
  return this
}

Slacker.prototype.daemon = function() {
  this._daemon = true
  return this
}

Slacker.prototype.minConnections = function(min) {
  this._minConnections = min
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
Slacker.prototype.end =
Slacker.prototype.close = function() {
  this._isClosed = true
  if (!this._child) return

  if (this._child.connected) {
    this._child.disconnect()
  }
}

// TODO: tidy this
function spawn(parent, fn) {
  if (!parent) throw new Error('missing parent')
  if (!('_port' in parent)) throw new Error('missing parent._port')
  var port = parent._port
  if (!('_timeout' in parent)) throw new Error('missing parent._timeout')
  var timeout = parent._timeout
  if (!parent._service) throw new Error('missing parent._service')
  var args = parent._service
  parent._child = undefined
  var minConnections = parent._minConnections || 0
  domain
  .create()
  .on('error', function onError(err) {
    console.error(err)
    console.error(err.stack)
    parent._child && parent._child.kill()
    process.exit(1)
  })
  .run(function spawnProcess() {
    if (parent._isClosed) return
    parent._child = fork(__dirname + '/bin/spawn', [
      '--port='+port,
      '--timeout='+timeout,
      '--minConnections='+minConnections,
      parent._doStart ? '--start' : '--no-start',
      '--'
    ].concat(args.split(' ')), {env: process.env, silent: parent._silent})
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
}
