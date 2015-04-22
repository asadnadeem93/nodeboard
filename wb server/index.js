var app = require('http').createServer(require('node-noop').noop)
  , io = require('socket.io')(app);



app.listen(8080);


io.on('connection', function(socket) {
  console.log("Connected: ", socket.conn.id);

  socket.on('points', function(data) {
    socket.broadcast.emit('points', data);
  });

  socket.on('clear', function(data) {
    socket.broadcast.emit("clear");

    console.log("cleared canvas...");
  });
});

console.log("Server started!");