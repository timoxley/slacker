var onDemand = require('../../')

var A = onDemand(__dirname + '/server.js')
.timeout(100)
.listen(9001, function(err, port) {
  console.log(arguments)
})
