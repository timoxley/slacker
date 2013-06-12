var net = require('net')
var cluster = require('cluster')
var log = require('debug')('spawn-on-demand ' + process.pid)

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
  var child = {
    connections: 0,
    connecting: false
  }

  var server = net.createServer(onConnection)
  server.listen(port, function() {
    log('listening on %d', server.address().port)
    if (process.send) process.send(server.address().port)
  })

  configureCluster(args)

  function onConnection(socket) {
    socket.pause()
    child.connections++

    // reset shutdown timeout on new connections
    clearTimeout(child.shutdown)

    log('connecting. connections:', child.connections)

    start(function(worker, address) {
      // connect incoming request to service
      socket.pipe(net.connect(address, function() {
        socket.resume();
      })).pipe(socket)

      socket.on('close', onClose)
    })

    // call fn with connection address
    // when we know it.
    // returns immediately if we already have
    // a connection open.
    function start(fn) {
      if (!child.connecting && child.address) return fn(child.address)
      if (child.connecting) return

      child.connecting = true

      log('booting new', args)
      var worker = cluster
      .fork()
      // wait for child to start listening
      .once('listening', function onListening(address) {
        if (address.port === 0) return
        fn(worker, address)
      })
      .on('message', function onMessage(msg) {
        if (!msg.port) return
        worker.removeListener('message', onMessage)
        worker.removeAllListeners('listening') // node 0.8 mode
        return fn(worker, msg)
      })
      child.worker = worker
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

function configureCluster(args) {
  args = args.split(' ')
  cluster.setupMaster({
    exec : args[0],
    args : args.slice(1)
  })
}
