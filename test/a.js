var http = require('http')
var cluster = require('cluster')
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
process.stuff = true
http.createServer(function(req, res) {
  res.end('hi')
}).listen(0, function() {
})
