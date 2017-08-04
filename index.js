'use strict';

const http = require('http');
const url = require('url');
const REPL = require("repl");
const Stream = require('stream');

const Socket = require('socket.io');
const send = require('send');
const intercept = require("intercept-stdout");
const str = require('string-to-stream');


function SockMonkey(opts) {

  if (!(this instanceof SockMonkey)) {
    return new SockMonkey(opts);
  };
  
  var inStream = new Stream.Readable();

  let app = http.createServer((req, res) => {
    send(req, url.parse(req.url).path, { root: 'public'}).pipe(res);
  });
  
  app.listen(opts.port || 80);

  let io = Socket(app);

  io.on('connection', function (socket) {
    
    let unhook_intercept = intercept(function(txt) {
      socket.emit("monkeyDo", txt);
      return "";
    }); 

    const repl = REPL.start({prompt: "> ", terminal: false});//, input: inStream, output: process.stdout });
    
    socket.on('monkeySee', function(data) {
     
      process.stdin.emit('data', data + "\n");  
      //str(data + "\n").pipe(process.stdin, { end: false });
    });

    setTimeout(function() { console.log("HIYA")}, 5000 );
    
  });

}

module.exports = SockMonkey;
 

