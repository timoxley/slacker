var onDemand = require('../../')

var A = onDemand(9001)
.timeout(100)
.spawn(__dirname + '/server.js', function(err, port) {
  console.log(arguments)
})
