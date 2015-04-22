var http = require('http')
  , fs = require('fs');

var server = http.createServer(function(req, res) {

  var path = req.url.substring(1);

  if (!fs.existsSync(path || 'index.html')) {
  	res.writeHead(404);
  	res.end();
  	return;
  }

  var html  = fs.readFileSync(path || 'index.html');

  console.log("Serving file:" + (path || 'index.html'));

  res.writeHead(200, {'Content-text': 'text/html'});

  res.end(html);

});

server.listen(3000);