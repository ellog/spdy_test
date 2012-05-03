var spdy = require('spdy'),
    fs = require('fs');

var options = {
  key: fs.readFileSync(__dirname + '/keys/spdy-key.pem'),
  cert: fs.readFileSync(__dirname + '/keys/spdy-cert.pem'),
  ca: fs.readFileSync(__dirname + '/keys/spdy-csr.pem')
};

var server = spdy.createServer(options, function(req, res) {
  if(!!req.isSpdy === false ) {
    res.writeHead(200);
    res.end("Your browser doesn't support SPDY");
    return;
  }
  var url_ = req.client.headers.url.split(/[?#]/)[0];

  // console.log("streamID: "+req.streamID + ", url: "+url_);

  if(url_ === "/") {
    var mesg_ = req.isSpdy ? "Hello SPDY!" : "Hello HTTPS"
    res.writeHead(200);

    res.end(mesg_);
  } else {
    var file_ = __dirname + "/public" + url_;
    fs.readFile(file_, function(err, data) {
      if(!!err === false) {
        var contentType = null;
        if(url_.match(/png$/)) {
          contentType = "image/png";
        } else if (url_.match(/html$/)) {
          contetnType = "text/html";
        } else if (url_.match(/css$/)) {
          contetnType = "text/css";
        } else if (url_.match(/js$/)) {
          contetnType = "application/javascript";
        } else {
          contetnType = "text/plain";
        }
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
