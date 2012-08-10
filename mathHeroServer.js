//SIMPLE MATH GAME SERVERSIDE

//HTTP SERVER SETUP============================================================
var http         = require('http'),
	fs           = require('fs'),
	server       = http.createServer(reqHandler).listen(8002),
	url          = require('url'),
	io           = require('C:/node/node_modules/socket.io/lib/socket.io.js').listen(server),
	participants = [],
	highScores   = [],
	services;

function reqHandler(req, res) {
    var request = url.parse(req.url, true),
        action  = request.pathname,
        output  = processAction(action);
    if (output) {
    	res.writeHead(200, 
    		{
    	    'Content-Type'                : output.mimeType,
    		'Access-Control-Allow-Origin' : '*',
    		'Access-Control-Allow-Methods': 'POST' 
    		}
    	);
    	res.end(output.data);
    }
    else{
    	res.writeHead(500);
    	res.end('Something went wrong...');
    }    
}

function processAction(action){
	console.log('Processing action...')
	for (var i = 0; i < services.length; i++) {	
		if (action == services[i].identifier) {
	        var data = services[i].service(),
	        type     = services[i].mimeType;
	        return {'data': data, 'mimeType': type};
	    }
	}
	return false;
}

services = [
	{'identifier': '/mathhero'                 ,'service': mathhero    ,'mimeType': 'text/html'       },
	{'identifier': '/mathHero.js'              ,'service': mathheroJS  ,'mimeType': 'text/javascript' },
	{'identifier': '/timeWorker.js'            ,'service': timeWorker  ,'mimeType': 'text/javascript' },
	{'identifier': '/statWorker.js'            ,'service': statWorker  ,'mimeType': 'text/javascript' },
	{'identifier': '/Nightmare_Hero_Normal.ttf','service': heroFont    ,'mimeType': 'application/octet-stream' },
	{'identifier': '/mathHero.css'             ,'service': mathheroCSS ,'mimeType': 'text/css'        }
];

function mathhero () {
	var output = fs.readFileSync(__dirname + '/mathHero.html');
	return output;}

function mathheroJS () {
	var output = fs.readFileSync(__dirname + '/mathHero.js');
	return output;}

function mathheroCSS (){
	var output = fs.readFileSync(__dirname + '/mathHero.css');
	return output;
}

function timeWorker () {
	var output = fs.readFileSync(__dirname + '/timeWorker.js');
	return output;
}

function statWorker () {
	var output = fs.readFileSync(__dirname + '/statWorker.js');
	return output;
}

function heroFont () {
	var output = fs.readFileSync(__dirname + '/Nightmare_Hero_Normal.ttf');
	return output;
}

//SOCKET SETUP=================================================================

io.sockets.on('connection', function(socket){

	socket.on('addToParticipants', addToParticipants);
	socket.on('disconnect', disconnect);
	socket.on('timesUp', timesUp);
	socket.on('answer', answer);

	function addToParticipants (newName) {
		socket.userName = newName;
		participants.push(newName);
		io.sockets.emit('participants', participants);
	}

	function disconnect () {
		participants.remove(this.userName);
		io.sockets.emit('participants', participants);
	}

	function timesUp (score) {
		updateHighScores(this.userName, score);
		io.sockets.emit('highScores', highScores);
	}

	function answer (problem) {
		var arg1 = problem.arg1,
		arg2     = problem.arg2,
		level	 = problem.level,
		usrAns   = problem.answer,
		realAns  = processAnswer(arg1, arg2, level);
		if(usrAns == realAns){
			socket.emit('correct');
		}
		else{
			socket.emit('incorrect');
		}
	}

		socket.emit('signIn');
		socket.emit('highScores', highScores);

});

//HELPERS======================================================================

function updateHighScores (user, score) {
	if(highScores.length >= 1){
		highScores.push({'user': user, 'score': score});
		highScores.sort(sortHelper);
	}
	else{
		highScores.push({'user': user, 'score': score});
	}

	function sortHelper (score1, score2){
		var output = (score1.score >= score2.score)? -1 : 1;
		return output;
	}
}

function processAnswer (arg1, arg2, level) {
	switch(level){
		case 1 : return (arg1 + arg2);
		case 2 : return (arg1 - arg2);
		case 3 : return (arg1 * arg2);
		case 4 : 
			console.log(arg1 % arg2);
			return (arg1 % arg2);
		default: return null;
	}
}

//PROTOTYPAL ADDS==============================================================

Array.prototype.remove = function(val) {
	if(this.indexOf(val) != -1){
		this.splice(this.indexOf(val), 1);
		return true;
	}
	return false;
}