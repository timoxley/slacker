var net = require('net')
var cluster = require('cluster')
console.dir(cluster)
cluster._getServer = function(tcpSelf, address, port, addressType, fd, cb) {
  // This can only be called from a worker.
  assert(cluster.isWorker);

  // Store tcp instance for later use
  var key = [address, port, addressType, fd].join(':');
  serverListeners[key] = tcpSelf;

  // Send a listening message to the master
  tcpSelf.once('listening', function() {
    cluster.worker.state = 'listening';
    sendInternalMessage(cluster.worker, {
      cmd: 'listening',
      address: address,
      port: tcpSelf.address().port || port,
      addressType: addressType,
      fd: fd
    });
  });

  // Request the fd handler from the master process
  var message = {
    cmd: 'queryServer',
    address: address,
    port: port,
    addressType: addressType,
    fd: fd
  };

  // The callback will be stored until the master has responded
  sendInternalMessage(cluster.worker, message, function(msg, handle) {
    cb(handle);
  });

};


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
