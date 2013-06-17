# Slacker

### Spawn workers when they are needed, otherwise kill them.

## Example

```js
var slacker = require('slacker')

slacker(__dirname + '/some-service.js') // service to forward requests to
.timeout(10000) // service will be shut down after 10s of no active connections (default)
.listen(9000, function(err, port) { // listen on port 9000
  if (err) return console.error(err)
  console.log('slacker listening on %d', port)
})

```


## Node 0.8 support

Due to a '[feature](https://github.com/joyent/node/pull/4104)' in node
pre 0.9.2,  you have to manually tell the slacker parent process what port
you're listening on.


```js
//In the app you want spawned by slacker
var app = http.createServer()
app.listen(function() {
  process.send && process.send(app.address()) // Node < 0.9.2 support
})

```

## Licence

MIT
