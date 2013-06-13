# Slacker

### Awaken workers when they are needed, otherwise kill them.

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

## Licence

MIT
