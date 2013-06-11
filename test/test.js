var cluster = require('cluster')
var request = require('request')
var onDemand = require('../')
onDemand(7090).spawn(__dirname + '/a.js')

//request('http://localhost:7090')
