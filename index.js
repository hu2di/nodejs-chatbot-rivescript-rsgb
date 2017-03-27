var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Include .html file
app.get('/', function(req, res) {
	//res.send('<h1>RoboChat</h1>');
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	//User connected
	console.log('A user connected! id = ' + socket.id);
	robotAnswer(socket, "", "");
	
	//User disconnected
	socket.on('disconnect', function() {
		console.log('A user disconnected! id = ' + socket.id);
	});
	
	//Show message send from user
	socket.on('new message', function(strJson) {
		robotAnalyze(socket, strJson);
	});
});

//Robot Analyze
function robotAnalyze(socket, strJson) {
	var json = JSON.parse(strJson);
	var username = json.username;
	var message = json.message;
	message = change_alias(message);
	console.log(username + ">" + message);
	
	//Gửi lại câu của user về trình duyệt
	var strJson = '{ "username": "User", "message": "' + message + '" }';;
	io.to(socket.id).emit('new message', strJson);
	
	robotAnswer(socket, username, message);
}

//Convert tieng viet
function change_alias(alias) {
	var str = alias;
	str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
	str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    str = str.replace(/ + /g," ");
    str = str.trim();
	return str;
}

//RiveBot
var RiveScript = require("rivescript-rsgb");
var	fs = require("fs");
var bot = new RiveScript();
bot.Stream(fs.readFileSync("rs-standard.rive", "utf8"));
bot.SortReplies();

//Robot answer
function robotAnswer(socket, username, message) {
	var reply;
	if (message == "") {
		reply = "Hi there."
	} else {
		reply = bot.Reply(username, message);
	}
	console.log("Bot>", reply);
	var strJson = '{ "username": "Robot", "message": "' + reply + '" }';;
	io.to(socket.id).emit('new message', strJson);
}

//Listen port 3000
http.listen(3000, function() {
	console.log('listening on *:3000');
});