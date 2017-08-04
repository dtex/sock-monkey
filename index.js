'use strict';

const http = require('http');
const Socket = require('socket.io');
const send = require('send');
const url = require('url');
const REPL = require("repl");
const ss = require('socket.io-stream');
const intercept = require("intercept-stdout");
const str = require('string-to-stream');
var stream = require('stream');

const myStream = new stream.Duplex({
  read(size) {
    // ...
  },
  write(chunk, encoding, callback) {
    // ...
  }
});

function SockMonkey(opts) {

  if (!(this instanceof SockMonkey)) {
    return new SockMonkey(opts);
  };
  
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

    const repl = REPL.start({prompt: "> ", terminal: false, input: myStream, output: process.stdout });
    
    socket.on('monkeySee', function(data) {
     str(data + "\n").pipe(myStream);
    });
    
  });

}

module.exports = SockMonkey;
 

