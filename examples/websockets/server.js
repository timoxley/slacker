"use strict"

var http = require('http');
var shoe = require('shoe')

var ecstatic = require('ecstatic')({
  root       : __dirname,
  baseDir    : '/',
  cache      : 3600,
  showDir    :true,
  autoIndex  :true,
  defaultExt : 'html', 
  gzip       : false
});

var server = http.createServer(ecstatic);
server.on('request', function(req) {
  console.log(req.url)
})
server.listen(9002, function() {
  console.log('ready')
  process.send && process.send(server.address())
})

var sock = shoe(function (stream) {
  console.log('new stream')
    var iv = setInterval(function () {
        stream.write(Math.floor(Math.random() * 2));
    }, 250);
    stream.on('close', function() {
      console.log('stream close')
    })
    stream.on('end', function () {
      console.log('stream end')
        clearInterval(iv);
    });

    stream.pipe(process.stdout, { end : false });
});
sock.install(server, '/invert');
