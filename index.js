"use strict"

var fork = require('child_process').fork
var fs = require('fs')
var domain = require('domain')

module.exports = function(port) {
  port = port || 0
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
        var cmd = args.split(' ')[0]
        fs.exists(cmd, function(exists) {
          if (!exists) return fn(new Error('command not found: ' + cmd))
          child = fork(__dirname + '/bin/spawn', [port, timeout].concat(args), {env: process.env})
          .on('message', function onMessage(msg) {
            if (port && msg != port) return
            this.removeListener('listening', onMessage)
            fn(null, parseInt(msg))
          })

          process.once('exit', function() {
            close()
          })
        })
      }

      function close() {
        child && child.disconnect()
      }
    }
  }

  return api
}
