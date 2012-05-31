var spdy = require('spdy')
  , http = require('http')
  , fs = require('fs');

// implement last() for Array
// Ref : http://stackoverflow.com/questions/3235043/last-element-of-array-in-javascript
if(!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  }
}

var options = {
  key: fs.readFileSync(__dirname + '/keys/spdy-key.pem'),
  cert: fs.readFileSync(__dirname + '/keys/spdy-cert.pem'),
  ca: fs.readFileSync(__dirname + '/keys/spdy-csr.pem')
};

var mimeTypes = {
  "png" : "image/png"
  , "html" : "text/html"
  , "css" : "text/css"
  , "js" : "application/javascript"
  , "txt" : "text/plain"
}

// this array stacks user's message
var mesgstacks = [];

var requestHandler = function(req, res) {
  var url_ = req.url.split(/[?#]/)[0];
  console.log("============= "+url_+" ======================");

  if(url_ === "/") {
    var mesg_ = req.isSpdy ? "Hello SPDY!" : "Hello HTTPS"
    res.writeHead(200, {'content-type' : 'text/html'});
    res.end(mesg_);
  } else {
    // Generic Web Server enhanced via SPDY technology
    var file_ = __dirname + "/public" + url_;
    fs.readFile(file_, function(err, data) {
      if(!!err === false) {
        var ext = url_.split(".").last()
          , contentType = mimeTypes.hasOwnProperty(ext) ? mimeTypes[ext] : "text/plain";

        res.writeHead(200, {
          "Content-Type": contentType,
          "Content-Length" : data.length }
        );
        res.end(data);
      } else {
        res.writeHead(404);
        res.end("file not found");
      }
    });
  }
}

spdy.createServer(options, function(req, res) {
  requestHandler(req, res);
}).listen(10001);
http.createServer(function(req, res) {
  requestHandler(req, res);
}).listen(10002);
