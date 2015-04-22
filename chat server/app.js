var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io')(server , {origins: "localhost:*"}),
	nicknames = [],
	mongoose = require('mongoose');
	
server.listen(3000);

mongoose.connect('mongodb://localhost/chat',function(err){
	if (err) {
		console.log(err);
	}else{
		console.log("hurray");
	}
});

var chatSchema = mongoose.Schema({
	nick: String,
	msg: String,
	created: {type:Date, default: Date.now}
});

var Chat = mongoose.model('Message', chatSchema);


app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.get('/', function(req, res){
	res.sendfile(__dirname + '/script.js');
});

app.get('/index.js', function(req, res){
	res.sendfile(__dirname + '/index.js');
});

app.get('/style.css', function(req, res){
	res.sendfile(__dirname + '/style.css');
});


io.sockets.on('connection', function(socket){
	Chat.find({}, function(err, docs){
		if (err) throw err;
		console.log("sending old messages");
		socket.emit('load old msgs', docs);
	});
	socket.on("new users", function(data, callback){
		if (nicknames.indexOf(data) != -1) {
			callback(false);
		} else{
			callback(true);
			socket.nickname = data;
			nicknames.push(socket.nickname);
			updateNicknames();
		}
	});

	socket.on('send message', function(data){
		var newMsg = new Chat({msg:data, nick: socket.nickname});
		newMsg.save(function(err){
			if (err) throw err;
			io.sockets.emit('new message',{msg: data, nick: socket.nickname});
		});
	});

	socket.on('disconnect', function(data){
		if (!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
	});

	function updateNicknames(){
		io.sockets.emit('usernames', nicknames);
	}
});