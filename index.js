var express = require('express');
var app = express();
var io = require('socket.io');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ss = require('socket.io-stream');
var path = require('path');
var fs = require('fs');

const folder = './files/';

app.use(express.static(__dirname));

app.get('/',function (request,response) {
	response.sendFile(__dirname + '/index.html');
});

http.listen(8080,function (socket) {
	console.log("Listening *:8080");
});

function fileList(){
	fs.readdir(folder,function (err,files) {
		if (!err) {
			files.forEach(function (item, index) {
						io.emit('file_list',item);
					});
		}
		
	});
}

io.on('connection',function (socket) {
	console.log("Connection user -> "+socket.id);
	fileList();

	socket.on('del',function(del){
		console.log(del);

		fs.unlink(folder+del.name,function(err){
			if(err) throw err;

			fileList();
			console.log("Successfuly Deleted");
		});
	});

	socket.on('file_list',function(){
		fileList();
	});

	ss(socket).on('file',function(stream, data){
		var filename = path.basename(data.name);
		stream.pipe(fs.createWriteStream('files/'+filename));
		console.log("Yaziyor");
	});
});