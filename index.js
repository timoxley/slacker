var net = require('net')
var cluster = require('cluster')
var log = require('debug')('spawn-on-demand')

cluster.on('disconnect', function() {
  log('disconnected worker', [].join.call(arguments, ', '))
})
.on('listening', function() {
  log('worker listening', [].join.call(arguments, ', '))
})
.on('online', function() {
  log('worker online', [].join.call(arguments, ', '))
})

module.exports = function(port) {
  var child = {
    connections: 0,
    connecting: false
  }

  var server = net.createServer(function(socket) {
    child.connections++
    log('connecting. connections:', child.connections)

    function start(fn) {
      if (!child.connecting && child.address) return fn(child.address)
      cluster.once('listening', function(worker, address) {
        console.log(require('util').inspect(worker.process, { showHidden: true, depth: 4}))
        child.connecting = false
        child.address = address
        child.worker = worker
        fn(address)
      })

      if (child.connecting) return
      log('booting new')
      child.connecting = true
      cluster.fork()
    }
    start(function(address) {
      clearTimeout(child.shutdown)
      socket.pipe(net.connect(address)).pipe(socket)
      socket.on('close', function() {
        child.connections--
        log('connection closed. connections:', child.connections)
        if (child.connections === 0) {
          log('shutting down in %dms', 10000)
          child.shutdown = setTimeout(function() {
            log('shutting down')
            child.worker.disconnect()
            delete child.worker
            delete child.address
          }, 10000)
        }
      })
    })
  })
  server.listen(port)

  return {
    spawn: spawn
  }
}

function spawn(args) {
  args = args.split(' ')
  cluster.setupMaster({
    exec : args[0],
    args : args.slice(1)
  })
}
