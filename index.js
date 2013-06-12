"use strict"

var fork = require('child_process').fork
var domain = require('domain')

module.exports = function(port) {
  var timeout = 10000

  // chainable interfaces i guess is cool.
  var api = {
    timeout: function(newTimeout) {
      timeout = parseInt(newTimeout, 10)
      return api
    },
    spawn: function(args, fn) {
      var child = undefined

      domain.create()
      .on('error', onError)
      .run(spawn)

      return {
        close: close
      }
      
      function onError(err) {
        console.error(err)
        child.kill()
        process.exit(1)
      }

      function spawn() {
        child = fork(__dirname + '/bin/spawn', [port, timeout].concat(args), {env: process.env})
        .on('message', function onMessage(msg) {
          if (msg != port) return
            this.removeListener('listening', onMessage)
          fn(null)
        })

        process.once('exit', function() {
          close()
        })
      }

      function close() {
        child && child.disconnect()
      }
    }
  }

  return api
}
