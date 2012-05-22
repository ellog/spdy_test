var spdy = require('spdy'),
    fs = require('fs');

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

var server = spdy.createServer(options, function(req, res) {
  var url_ = req.url.split(/[?#]/)[0];
  console.log("============= "+url_+" ======================");



  if(url_ === "/") {
    var mesg_ = req.isSpdy ? "Hello SPDY!" : "Hello HTTPS"
    res.writeHead(200, {'content-type' : 'text/html'});
    res.end(mesg_);
  } else if( url_ === "/pushtest" ) {
    var headers_ = { 'content-type' : 'application/javascript' }
    res.push("/a.js", headers_, function(err, stream) {
      stream.end("alert('a');");
    });

    res.push("/b.js", headers_, function(err, stream) {
      stream.end("alert('b');");
    });

    res.writeHead(200, {'content-type' : 'text/html'});
    res.write("<h1>push test</h1>");
    // res.write("<script src='a.js'></script>");
    res.write("<script>");
    res.write("console.log(0);");
    res.write("setTimeout(function(e) {");
    res.write("console.log('attempt to load b.js');var obj = document.createElement('script');obj.src='b.js';document.body.appendChild(obj);");
    res.write("}, 5000);");
    res.write("</script>");
    res.end("");
  } else if( url_ === "/chatmesg") {
    var mesg_ = req.url.split("?")[1];
    mesg_ = !!mesg_ === false ? "empty message" : mesg_.replace("<", "&lt;").replace(">", "&gt;");
    mesgstacks.push(mesg_);
    console.log("=== recv mesg ===");
    console.dir(mesgstacks);

  } else if (url_.indexOf("/push/initiator") === 0 ) {
    var headers_ = { 'content-type' : 'application/javascript' }
      , id_ = new Date().getTime()
      , fname_ = ["/push/", id_].join("")

    res.push(fname_, headers_, function(err, stream) {
      if(err) {
        console.dir(err);
        return;
      }

      var timer = setInterval(function(){
        if(mesgstacks.length > 0) {
          console.log("=== timer ===");
          console.dir(mesgstacks);
          clearInterval(timer);

          var mesg_ = mesgstacks.shift();
          stream.write('console.log("' + mesg_ + '");');

          stream.write('document.body.removeChild(obj);');
          stream.write('var initObj = document.createElement("script");');
          stream.write('initObj.src = "/push/initiator' + id_ + '";');
          stream.write('document.body.appendChild(initObj);');
          stream.end("");
        }
      }, 100);
    });

    res.writeHead(200, headers_);
    res.write('document.body.removeChild(initObj);');
    res.write('var obj = document.createElement("script");');
    res.write('obj.src = "' + fname_ + '";');
    res.write('document.body.appendChild(obj);');
    res.end("");
  } else if (url_.indexOf("/push/") === 0 ) {
    res.writeHead(200, { 'content-type' : 'application/javascript' });
    res.write('document.body.removeChild(obj);');
    res.write('var initObj = document.createElement("script");');
    res.write('initObj.src = "/push/initiator' + new Date().getTime() + '";');
    res.write('document.body.appendChild(initObj);');
    res.end("");
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
});

server.listen(10001);
