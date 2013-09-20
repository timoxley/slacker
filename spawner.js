"use strict"

var net = require('net')
var cluster = require('cluster')
var log = require('debug')(require('./package.json').name + ' ' + process.pid)
var EventEmitter = require('events').EventEmitter
var which = require('which')

var path = require('path')

cluster.on('disconnect', function(worker) {
  log('disconnected worker %d.', worker.id)
})
.on('listening', function(worker) {
  log('worker listening %d.', worker.id)
})
.on('online', function(worker) {
  log('worker online %d.', worker.id)
})

module.exports = function(port, timeout, args) {
  // TODO: should probably make a 'class'
  // representing connection to worker
  log('starting listener on port %d', port)
  var child = {
    connections: 0,
    status: new EventEmitter()
  }

  configureCluster(args, function() {
    var server = net.createServer(onConnection)
    server.listen(port, function() {
      log('listening on %d', server.address().port)
      if (process.send) process.send(server.address().port)
    })
  })



  function onConnection(socket) {
    child.connections++
    log('connecting. connections: %d', child.connections)

    socket.on('end', onClose)

    socket.pause() // wait for connection to service

    clearTimeout(child.shutdown) // reset shutdown timeout on new connections

    start(function(address) {
      log('connecting to %d.', address.port)
      var service = net.connect(address.port, function() {
        log('piping request to %d.', address.port)
        socket.pipe(service).pipe(socket)
        socket.resume()
      })
    })

    // call fn with connection address
    // as soon as we know it.
    // calls immediately if we already have
    // a connection open.
    function start(fn) {
      if(child.address) return fn(child.address)
      var status = child.status
      status.once('ready', function() {
        fn(child.address)
      })

      if (child.worker) {
        log('connection waiting for worker')
        return
      }

      log('booting new worker', args)
      // Note:
      // JSON parse/stringify here
      // Prevents strange error:
      //   child_process.js:608
      //   envPairs.push(key + '=' + env[key]);
      //   TypeError: Cannot convert object to primitive value
      var env = JSON.parse(JSON.stringify({env: process.env}))
      var worker = child.worker = cluster.fork(env)
      .once('listening', onListening)
      .once('message', onMessage)

      function onListening(address) {
        if (address.port === 0) return
        worker.removeListener('listening', onListening) 
        worker.removeListener('message', onMessage) 
        child.address = address
        status.emit('ready')
      }

      function onMessage(msg) {
        // node 0.8 mode
        if (!msg.port) return
        worker.removeListener('listening', onListening) 
        worker.removeListener('message', onMessage) 
        child.address = msg
        status.emit('ready')
      }
    }

    function onClose() {
      child.connections--
      log('connection closed. connections:', child.connections)

      // start shutdown timeout if no more connections
      if (child.connections === 0) {
        // TODO: make timeout configurable
        log('shutting down in %dms', timeout)
        child.shutdown = setTimeout(function() {
          log('shutting down worker %d.', child.worker.id)
          if (child.worker.process.connected) child.worker.disconnect()
          delete child.worker
          delete child.address
        }, timeout)
      }
    }
  }
}

process.on('disconnect', function() {
  log('parent disconnected')
  setTimeout(function() {
    log('cluster.disconnect timed out. killing.')
    for (var id in cluster.workers) {
      cluster.workers[id].kill()
    }
    process.exit()
  }, 3000)
  cluster.disconnect(function() {
    log('disconnected all workers!')
    process.exit()
  })
})

function configureCluster(args, fn) {
  args = args.split(' ')
  var cmd = args[0]
  which(cmd, function(err, cmd) {
    if (err) return fn(err)
    process.title = 'slacker: ' + path.basename(cmd) + ' ' + args.slice(1)
    return fn(null, cluster.setupMaster({
      exec : cmd,
      args : args.slice(1)
    }))
  })
}
