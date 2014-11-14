var http = require('http')
var server = http.createServer(function(req, res) {
  res.statusCode = 200
  res.end('success')
})

server.listen(process.argv[2], function() {
  console.log(server.address())
})
