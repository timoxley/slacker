![https://travis-ci.org/timoxley/slacker.png](https://travis-ci.org/timoxley/slacker.png)

# Slacker

Save precious system resources by creating lazy network services that are only spawned when required.

## How

**Slacker listens for arbitrary TCP connections on behalf of your 
resource hungry processes, allowing them to remain dormant until
required.**

When a request for that service comes in, slacker buffers the request, 
boots the service if it is not already running,
and forwards the connection to the service; this is only feasible because
node processes boot reasonably quickly (<10ms). 

After a specified timeout, if all the connections are closed and there
are no new connections, slacker will shutdown/terminate the 
worker process, until the next request for it arrives.

Slacker should support any protocol built on top of TCP, such as
HTTP, MQTT and WebSockets.

## Example

```js
var slacker = require('slacker')

slacker(__dirname + '/some-http-service.js') // service to forward requests to
.timeout(10000) // service will be shut down after 10s of no active connections (default)
.listen(9000, function(err, port) { // listen on port 9000
  if (err) return console.error(err)
  console.log('slacker listening on %d', port)
})

```

## Why

If you have a process or number of processes that need to respond to network events
but consume an unsustainable amount of system resources while they are
running, it is efficient to simply shut these services down while
they are not required!

Node doesn't currently have a non-hacky, reliable mechnism for unloading modules 
from memory, and this is ok, because there's a good workaround: The easiest 
way to clean up memory and prevent unnecessary idle work is to just isolate
that work to a process and kill it when it is no longer required. This
is the job of `slacker`.

## Node 0.8.x support

Normally, slacker can deduce what port your worker is listening on
but if you're using node < 0.9.2 [this feature](https://github.com/joyent/node/pull/4104),
mean **you must manually have your worker tell the slacker process what port
it's listening on**:

### Node 0.8.x Example

```js
//In the app you want spawned by slacker
var app = http.createServer()
app.listen(function() {
  process.send && process.send(app.address()) // Node < 0.9.2 support
})

```

If you're using node 0.9.2 and above, you do not need to do this.

## Licence

MIT
