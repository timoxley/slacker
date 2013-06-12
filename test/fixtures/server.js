var http = require('http')
var server = http.createServer(function(req, res) {
  res.statusCode = 200
  res.end((process.argv[2] || 'success'))
})

server.listen(function() {
  process.send(server.address())
})
