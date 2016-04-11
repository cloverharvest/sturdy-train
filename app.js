//Set-up client-side JS

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
    usernames = [];

//Set-up a port
//process.env.PORT is set-up for remote servers like heroku
//3000 is for the local server/host

server.listen(process.env.PORT || 3000);

//Load up the index file and create a route via app.get. the slash stands for the home page

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

//On connection start the sockets
io.sockets.on('connection', function(socket){

	socket.on('new user', function(data, callback) {
		//Verifies if a username has already been taken then false else is true or cleared to go
		if(usernames.indexOf(data) != -1) {
			callback(false);
		} else {
			callback(true);
			socket.username = data;
			usernames.push(socket.username);
			updateUsernames();
		}
	});

	//Update Usernames
	function updateUsernames() {
		io.sockets.emit('usernames', usernames);
	}

	// Send Message
	socket.on('send message', function(data){
		io.sockets.emit('new message',{msg: data, user: socket.username});
	});

	// Disconnect and delete usernames
	socket.on('disconnect', function(data) {
		if(!socket.username) return;
		usernames.splice(usernames.indexOf(socket.username), 1);
		updateUsernames();
	});
});
