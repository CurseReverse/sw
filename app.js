var express = require("express");
var app = express();
app.set("view engine","ejs");
var serv = require("http").Server(app);
var port = Number(process.env.PORT || 2000);
serv.listen(port);
var mongojs = require("mongojs");
var db = mongojs("db",["users","store","gamestate","gameHistory","playerStats"]);
var bodyParser = require("body-parser");
var session = require("client-sessions");
var bcrypt = require("bcryptjs"); 

//var init_cluster = require("./cluster.js");

var ss = require("./server/serverscript.js"); //including other javascript files from server folder

var io = require("socket.io")(serv,{});

var GAMESTATE = {};
var QUEUE = [];
var PREGAME = [];
var ALERTS = {};

ALERTS["Ian"] = [{sender: "TED", type: 3},{sender: "tyler", type: 4}];

console.log(JSON.stringify(ALERTS["Ian"]));

PREGAME.push({
	
	size: 0,
	pending: 0,
	fillTime: 0,
	queues: [],
	
});

console.log("Server Started");

//TESTING AREA ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//GENERATE GAMESTATES HERE...

GAMESTATE[1] = {
	
	id: 1,
	ranked: 1,
	day: 0,
	phase: "Pregame",
	phase_start: Date.now(),
	timer: 3,
	host: "ian",
	game_start: Date.now(),
	game_end: 0,
	sheep: 7,
	wolves: 2,
	eliminator: 0, //by seat number
	eliminated: 0, //by seat number
	eaten: 0, //by seat number
	seen: 0, //most recently seen player
	seenRole: "TBD",
	_protected: 0,
	trapped: 0,
	hypnotized: 0,
	recruited: 0,
	wolfSeen: 0,
	wolfSeenRole: 0,
	players: {},
	spectators: {},
	selections: [],
	evd: [],
	
};

	

	GAMESTATE[1].players[1] = {
		
		id: 11111,
		username: "ian",
		lives: 5,
		team: "w",
		role: "Wolf",
		roleCharges: 0,
		alive: 1,
		eaten: 0,
		eliminated: 0,
		seat: 1,
		seen: 0,
		accepted: 1,
		head: 0,
		eyes: 0,
		face: 0,
		body: 0,
		feet: 0,
		suspected: 0,
		trusted: 0,
		trustedThisPhase: 0,
		selection: 0,
		stat_eats: 0,
		stat_spec_eats: 0,
		karma: 25,
		winStreak: 0,
		longestWinStreak: 0,
		evd: {type: 1, target: 4, altered: 0},
		reportsReceived: 0,
		reportsSent: 0,
		rankPoints: 20,
		gamesPlayed: 0,
		gamesWon: 0,

	};


	GAMESTATE[1].players[2] = {
		
		id: 22222,
		username: "tyler",
		lives: 5,
		team: "s",
		role: "Seer",
		roleCharges: 1,
		alive: 1,
		eaten: 0,
		eliminated: 0,
		seat: 2,
		seen: 0,
		accepted: 1,
		head: 0,
		eyes: 0,
		face: 0,
		body: 0,
		feet: 0,
		suspected: 0,
		trusted: 0,
		trustedThisPhase: 0,
		selection: 0,
		stat_sus_chosen: 0,
		stat_sus_correct: 0,
		stat_tru_chosen: 0,
		stat_tru_correct: 0,
		stat_elim_chosen: 0,
		stat_elim_correct: 0,
		karma: 25,
		winStreak: 0,
		longestWinStreak: 0,
		evd: {type: 2, target1: 5, target2: 4, altered: 0},
		reportsReceived: 0,
		reportsSent: 0,
		rankPoints: 20,
		gamesPlayed: 0,
		gamesWon: 0,
		
	};

	GAMESTATE[1].players[3] = {
		
		id: 33333,
		username: "TED",
		lives: 5,
		team: "w",
		role: "Hypnotist",
		roleCharges: 1,
		alive: 1,
		eaten: 0,
		eliminated: 0,
		seat: 3,
		seen: 0,
		accepted: 1,
		head: 0,
		eyes: 0,
		face: 0,
		body: 0,
		feet: 0,
		suspected: 0,
		trusted: 0,
		stat_eats: 0,
		stat_spec_eats: 0,
		trustedThisPhase: 0,
		selection: 0,
		karma: 25,
		winStreak: 0,
		longestWinStreak: 0,
		evd: {type: 3, target1: 5, target2: 4, altered: 0},
		reportsReceived: 0,
		reportsSent: 0,
		rankPoints: 20,
		gamesPlayed: 0,
		gamesWon: 0,
		
	};

	GAMESTATE[1].players[4] = {
		
		id: 44444,
		username: "francis",
		lives: 5,
		team: "s",
		role: "Protector",
		roleCharges: 1,
		alive: 1,
		eaten: 0,
		eliminated: 0,
		seat: 4,
		seen: 0,
		accepted: 1,
		head: 0,
		eyes: 0,
		face: 0,
		body: 0,
		feet: 0,
		suspected: 0,
		trusted: 0,
		trustedThisPhase: 0,
		selection: 0,
		stat_sus_chosen: 0,
		stat_sus_correct: 0,
		stat_tru_chosen: 0,
		stat_tru_correct: 0,
		stat_elim_chosen: 0,
		stat_elim_correct: 0,
		karma: 25,
		winStreak: 0,
		longestWinStreak: 0,
		evd: {type: 1, target1: 8, altered: 0},
		reportsReceived: 0,
		reportsSent: 0,
		rankPoints: 20,
		gamesPlayed: 0,
		gamesWon: 0,
		
	};

	GAMESTATE[1].players[5] = {
		
		id: 55555,
		username: "jessy",
		lives: 5,
		team: "s",
		role: "Traitor",
		roleCharges: 0,
		alive: 1,
		eaten: 0,
		eliminated: 0,
		seat: 5,
		seen: 0,
		accepted: 1,
		head: 0,
		eyes: 0,
		face: 0,
		body: 0,
		feet: 0,
		suspected: 0,
		trusted: 0,
		trustedThisPhase: 0,
		selection: 0,
		stat_sus_chosen: 0,
		stat_sus_correct: 0,
		stat_tru_chosen: 0,
		stat_tru_correct: 0,
		stat_elim_chosen: 0,
		stat_elim_correct: 0,
		karma: 25,
		winStreak: 0,
		longestWinStreak: 0,
		reportsReceived: 0,
		reportsSent: 0,
		rankPoints: 20,
		gamesPlayed: 0,
		gamesWon: 0,
		
	};

	GAMESTATE[1].players[6] = {
		
		id: 66666,
		username: "cody",
		lives: 5,
		team: "s",
		role: "Trapper",
		roleCharges: 1,
		alive: 1,
		eaten: 0,
		eliminated: 0,
		seat: 6,
		seen: 0,
		accepted: 1,
		head: 0,
		eyes: 0,
		face: 0,
		body: 0,
		feet: 0,
		suspected: 0,
		trusted: 0,
		trustedThisPhase: 0,
		selection: 0,
		stat_sus_chosen: 0,
		stat_sus_correct: 0,
		stat_tru_chosen: 0,
		stat_tru_correct: 0,
		stat_elim_chosen: 0,
		stat_elim_correct: 0,
		karma: 25,
		winStreak: 0,
		longestWinStreak: 0,
		reportsReceived: 0,
		reportsSent: 0,
		rankPoints: 20,
		gamesPlayed: 0,
		gamesWon: 0,
		
	};

	GAMESTATE[1].players[7] = {
		
		id: 77777,
		username: "mich",
		lives: 5,
		team: "s",
		role: "Coroner",
		roleCharges: 0,
		alive: 1,
		eaten: 0,
		eliminated: 0,
		seat: 7,
		seen: 0,
		accepted: 1,
		head: 0,
		eyes: 0,
		face: 0,
		body: 0,
		feet: 0,
		suspected: 0,
		trusted: 0,
		trustedThisPhase: 0,
		selection: 0,
		stat_sus_chosen: 0,
		stat_sus_correct: 0,
		stat_tru_chosen: 0,
		stat_tru_correct: 0,
		stat_elim_chosen: 0,
		stat_elim_correct: 0,
		karma: 25,
		winStreak: 0,
		longestWinStreak: 0,
		reportsReceived: 0,
		reportsSent: 0,
		rankPoints: 20,
		gamesPlayed: 0,
		gamesWon: 0,
		
	};

	GAMESTATE[1].players[8] = {
		
		id: 88888,
		username: "nick",
		lives: 5,
		team: "s",
		role: "Sheep",
		roleCharges: 0,
		alive: 1,
		eaten: 0,
		eliminated: 0,
		seat: 8,
		seen: 0,
		accepted: 1,
		head: 0,
		eyes: 0,
		face: 0,
		body: 0,
		feet: 0,
		suspected: 0,
		trusted: 0,
		trustedThisPhase: 0,
		selection: 0,
		stat_eats: 0,
		stat_spec_eats: 0,
		karma: 25,
		winStreak: 0,
		longestWinStreak: 0,
		reportsReceived: 0,
		reportsSent: 0,
		rankPoints: 20,
		gamesPlayed: 0,
		gamesWon: 0,
		
	};

	GAMESTATE[1].players[9] = {
		
		id: 99999,
		username: "SUPERLONGNAMEE16",
		lives: 5,
		team: "s",
		role: "Sheep",
		roleCharges: 0,
		alive: 1,
		eaten: 0,
		eliminated: 0,
		seat: 9,
		seen: 0,
		accepted: 1,
		head: 0,
		eyes: 0,
		face: 0,
		body: 0,
		feet: 0,
		suspected: 0,
		trusted: 0,
		trustedThisPhase: 0,
		selection: 0,
		stat_sus_chosen: 0,
		stat_sus_correct: 0,
		stat_tru_chosen: 0,
		stat_tru_correct: 0,
		stat_elim_chosen: 0,
		stat_elim_correct: 0,
		karma: 25,
		winStreak: 0,
		longestWinStreak: 0,
		reportsReceived: 0,
		reportsSent: 0,
		rankPoints: 20,
		gamesPlayed: 0,
		gamesWon: 0,
		
	};



var gc = 2;
while(gc < 500){
	
	GAMESTATE[gc] = {
		
		id: gc,
		day: 0,
		phase: "Pregame",
		phase_start: Date.now(),
		timer: gc,
		host: "ian",
		game_start: Date.now(),
		game_end: 0,
		sheep: 7,
		wolves: 2,
		eliminator: 0, //by seat number
		eliminated: 0, //by seat number
		eaten: 0, //by seat number
		seen: 0,
		_protected: 0,
		players: {},
		spectators: {},
		selections: [],
		evd: [],
	};
	
	var pc = 1;
	while(pc < 9){

		GAMESTATE[gc].players[pc] = {
			
			id: pc,
			ranked: 1,
			username: "ai",
			lives: 5,
			team: "w",
			role: "Wolf",
			roleCharges: 0,
			alive: 1,
			eaten: 0,
			eliminated: 0,
			seat: 1,
			seen: 0,
			accepted: 1,
			head: 0,
			eyes: 0,
			face: 0,
			body: 0,
			feet: 0,
			suspected: 0,
			trusted: 0,
			trustedThisPhase: 0,
			selection: 0,
			stat_sus_chosen: 0,
			stat_sus_correct: 0,
			stat_tru_chosen: 0,
			stat_tru_correct: 0,
			stat_elim_chosen: 0,
			stat_elim_correct: 0,
			karma: 25,
			winStreak: 0,
			longestWinStreak: 0,
			reportsReceived: 0,
			reportsSent: 0,
			rankPoints: 20,
			gamesPlayed: 0,
			gamesWon: 0,
		};	
		
		pc++;
		
	}

	gc++;
}


//END TESTING AREA ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.use("/public",express.static(__dirname + "/public")); //allow us to include css/js/images in our HTML files / views
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({	
	cookieName: "session",  
	secret: "834hfglwe8266kdha7sa12",	
	activeDuration: 7 * 24 * 60 * 60 * 1000  //1 week of milliseconds
}));


//console.log(GAMESTATE[1]);
//console.log(GAMESTATE[1].players[1]);





//WHEN A PLAYER TRIES TO CONNECT, THIS RUNS
io.use(function(socket,next){
	
	//console.log("socket use");
	
	var rand_id = socket.handshake.query.rand_id;
	var seat = socket.handshake.query.seat;
	var game_id = parseInt(socket.handshake.query.game_id);
	
	console.log("socket " + rand_id + " " + seat + " " + game_id);
	
	var g = GAMESTATE[game_id];
	
	
	if(g){ //if the game is active, get the info
	
		if(rand_id == "spectate"){ //is a spectator, load spectator info EX: localhost:2000/game/1/spectate
			
			//create socket for spectator
			var random = Math.random();
			g.spectators[random] = socket;
			
			//load gamestate as if basic sheep (little as possible information)
			var pkg = [];
					
			//add gamestate
			pkg.push({
				type: "g", //is game state info, p is player info
				day: g.day,
				phase: g.phase,
				timer: g.timer,
				sheep: g.sheep,
				wolves: g.wolves,
				eliminator: g.eliminator,
				evd: g.evd,
			});
			
			
			for(var p in g.players){
				
				//if not me, add to package as I can see them
				var p = g.players[p];
				
				//var _protected;
				//anything that could possibly change based on role should go here...
				var team;
				var role;
				var seen;

					
				//if the player is dead, show team, but not role...
				if(p.alive == 0){
					team = p.team;
					role = p.team;
					seen = 0;
					
				}else{ //they are alive, show everyone as sheep...
					
					team = "s";
					role = "Sheep";
					seen = 0;
						
				}	

				pkg.push({
					type: "p", //player info
					username: p.username,
					team: team,
					role: role,
					alive: p.alive,
					eaten: p.eaten,
					eliminated: p.eliminated,
					seat: p.seat,
					seen: seen,
					head: p.head,
					eyes: p.eyes,
					face: p.face,
					body: p.body,
					feet: p.feet,
					karma: p.karma,
					suspected: p.suspected,
					trusted: p.trusted,
				});
				
				pkg.push({
					type: "tr",
					team: p.team,
					role: p.role,
				});
				

			}
			
			//SHUFFLE UP THE ARRAY, because true roles are in same order as fake ones... prevents cheating
			var currentIndex = pkg.length, temporaryValue, randomIndex;

			while (currentIndex !== 0){
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;
				temporaryValue = pkg[currentIndex];
				pkg[currentIndex] = pkg[randomIndex];
				pkg[randomIndex] = temporaryValue;
			 }

			socket.emit("gamestate",pkg);
			return next();

		}else{ //person connecting is a player, validate and send player info EX: localhost:2000/game/1/55555
			
			if(g.players[seat]){

				g.players[seat].socket = socket; //set socket

				var pkg = []; //create package
				
				//add gamestate
				pkg.push({
					type: "g", //is game state info, p is player info
					day: g.day,
					phase: g.phase,
					timer: g.timer,
					sheep: g.sheep,
					wolves: g.wolves,
					eliminator: g.eliminator,
					evd: g.evd,
				});
				
				//add players, change information based on known information
				var myRole = g.players[seat].role;
				var myTeam = g.players[seat].team;
				
				for(var p in g.players){
					
					//default
					var p = g.players[p];
					
					var team;
					var role;
					var seen = 0;
					var evd = "";
					var charges = 0;
					var hypnotized = 0;

					
					
					if(p.seat == seat){ //if me show extra stuff that only I know
						
						team = p.team;
						role = p.role;
						evd = p.evd;
						charges = p.roleCharges;
						
						if(p.seat == g.hypnotized) hypnotized = g.hypnotized //if im hypnotized, tell me
						
					}else{
						
						//if the player is dead, show team, but not role
						if(p.alive == 0){
							
							if(myRole == "Coroner"){
								team = p.team;
								role = p.role;
								
							}else if(myRole == "Seer"){
							
								team = p.team;
								seen = p.seen;
								if(p.seen == 1)	role = p.role;
								else	role = p.team;

							}else{
								team = p.team;
								role = p.team;							
								
							}
						
						}else{ //for the living players
							
							if(myRole == "Sheep"  || myRole == "Coroner" || myRole == "Protector" || myRole == "Trapper"){
								//if sheep show all as sheep...
								team = "s";
								role = "Sheep";

							}else if(myRole == "Seer"){ //make for all other relevent roles...
								
								if(p.seen == 0){
									
									team = "s";
									role = "Sheep";
									
								}else{
									
									team = p.team;
									role = p.role;
									seen = 1;
									
								}
								
							}else if(myRole == "Traitor"){
								
								team = p.team;
								role = p.team;
								
							}else if(myTeam == "w"){

								team = p.team;
								role = p.team;
								hypnotized = g.hypnotized; //shared info between wolves...					
								
							}
							
						}
						
					}

					pkg.push({
						type: "p", //player info
						username: p.username,
						team: team,
						role: role,
						alive: p.alive,
						eaten: p.eaten,
						eliminated: p.eliminated,
						seat: p.seat,
						seen: seen,
						head: p.head,
						eyes: p.eyes,
						face: p.face,
						body: p.body,
						feet: p.feet,
						karma: p.karma,
						suspected: p.suspected,
						trusted: p.trusted,
						evd: evd,
						charges: charges,
						hypnotized: hypnotized,
					});
					
					pkg.push({
						type: "tr",
						team: p.team,
						role: p.role,
					});
					
				}

				//SHUFFLE UP THE ARRAY, because true roles are in same order as fake ones... prevents cheating
				var currentIndex = pkg.length, temporaryValue, randomIndex;

				while (currentIndex !== 0){
					randomIndex = Math.floor(Math.random() * currentIndex);
					currentIndex -= 1;
					temporaryValue = pkg[currentIndex];
					pkg[currentIndex] = pkg[randomIndex];
					pkg[randomIndex] = temporaryValue;
				 }

				socket.emit("gamestate",pkg);
				return next();
			
				
			}else{
				
				//send error, invalid URL
				
			}
			
			
		}
	
	}else{ //game is over give them summary package then disconnect their socket...
		
		
		console.log("GAME OVER, SENDING SUMMARY " + game_id + " " + rand_id);
		
		//check mongo for history
		db.gameHistory.findOne({game_id: game_id},function(err,docs){

			if(docs.length > 0){ //if a game is found, show that doc to the user (end game summary info)
				
				var pkg = [];

				
				docs.forEach(function(doc){
					
					pkg.push({
						type: "s", //summary
						day: doc.day,
						phase: doc.phase,
						end_time: doc.end_time,
						sheep: doc.sheep,
						wolves: doc.wolves,
						winner: doc.winner,
						players: doc.players,
					});
					
				});
				
				socket.emit("gamestate",pkg);
				
			}else{
				
				//if cant find history, show error or something...
				return next(new Error("Game or player not found"));
				
			}

		});
		
	}

});
	


io.sockets.on("connection",function(socket){
	

	//console.log("test conn thing " + socket.handshake.query.rand_id);
	
	//console.log(socket.request);
	
	var address = socket.handshake.address;
	console.log('New connection from ' + address.address + ':' + address.port);
	

	socket.on("chatMessage",function(data){
		
		var g = GAMESTATE[data.game_id];
		
		if(g){ //if exists

			var sender;
			var seat = 0;
			var alive = 0;
			var phase = g.phase;
			
			if(data.rand_id == "spectate"){ //spectator
				
				sender = data.username;
				
			}else{ //non spectator
				
				if(g.players[data.seat].id == data.rand_id){ //validate player....
					
					sender = g.players[data.seat].username;
					seat = data.seat;
					alive = g.players[data.seat].alive;	
					if(alive == 0) seat = 0;  //unset seat if ur dead, because font should be gray
					
				}else{ //is invalid player hypnotist sending for player?
					
					if(data.seat == g.hypnotized){ //if the seat is hypnotized
						
						for(var i in g.players){
							
							var p = g.players[i];
							if(p.role == "Hypnotist" && p.id == data.rand_id){ //if from hypnotist, is a legit message
								
								sender = g.players[data.seat].username;
								seat = data.seat;
								alive = g.players[data.seat].alive;	
								for(var i in g.players){ //send to everyone...
									
									var p = g.players[i];
									
									var socket = p.socket;
									if(socket){
										socket.emit("newMessage",{
										
											sender: sender,
											type: data.type,
											seat: seat,
											msg: data.message,
										
										});					
										
									}

								}								
								break;
					
							}
							
						}
						
					}
					
				}
				
			}
			
			console.log("HYP CHAT " + sender + " " + seat + " " + data.rand_id);
			
			if(sender){ //If im validated, or a spectator....
				
				if(g.hypnotized == 0 || (seat != g.hypnotized && g.hypnotized != 0)){ //cant send messages if hypnotized

					//check message type, role and phase
					if(data.type == "all" && alive == 1 && phase != "Night" && phase != "Evening"){

						for(var i in g.players){ //send to everyone...
							
							var p = g.players[i];
							
							var socket = p.socket;
							if(socket){
								socket.emit("newMessage",{
								
									sender: sender,
									type: data.type,
									seat: seat,
									msg: data.message,
								
								});					
								
							}

						}
						
						//send to all spectators...
						for(var i2 in g.spectators){
							
							var socket = g.spectators[i2];
							if(socket){
								
								socket.emit("newMessage",{
									sender: sender,
									type: data.type,
									seat: seat,
									msg: data.message,
								});					
								
							}
							
						}	
						
					}else if(data.type == "wolf" && alive == 1 && phase != "Evening"){

						for(var i in g.players){ //wolf chat, send to wolves...
							
							var p = g.players[i];
							
							if(p.team == "w"){ //if you're on team wolf
							
								var socket = p.socket;
								if(socket){
									
									socket.emit("newMessage",{
										sender: sender,
										type: data.type,
										seat: seat,
										msg: data.message,
									});					
									
								}

							}
							
						}			
						
					}else if(data.type == "spectate"){
						
						//send to all dead players
						for(var i in g.players){
							
							var p = g.players[i];
							
							if(p.alive == 0){ //if dead
								
								var socket = p.socket
								if(socket){
									socket.emit("newMessage",{
										sender: sender,
										type: data.type,
										seat: seat,
										msg: data.message,
									});
									
								}
								
							}
							
						}
						
						//send to all spectators also...
						for(var i2 in g.spectators){
							
							var socket = g.spectators[i2];
							if(socket){
								
								socket.emit("newMessage",{
									sender: sender,
									type: data.type,
									seat: seat,
									msg: data.message,
								});					
								
							}
							
						}
						
					}
				
				}				

			}
		
		}
			
	});
	
	socket.on("selectPlayer",function(data){ //for choosing players in all phases
		
		//cast selections and calculate...
		console.log("SELECTPLAYER " + data.selection + " " + data.phase);
		
		var g = GAMESTATE[data.game_id];
		var p = g.players[data.seat];
		var c = p.selection;

		if(g){ //and your game exists
			
			if(p){ //and you exist

				if(p.alive == 1){ //and you're alive
				
					if(p.id == data.rand_id){ //validate player...
						
						if(data.phase == "recruiting"){
							
							g.recruited = data.selection;
						
						}else{
							
							p.selection = data.selection;
							
						}
					
					}else if(g.hypnotized != 0){ //rand_id and seat don't match, hypnotist doing something
						
						for(var i in g.players){
							var p2 = g.players[i];
							if(p2.role == "Hypnotist" && p2.id == data.rand_id){
								
								p.selection = data.selection;
								break;
								
							}
						}
						
						
					}

				}
			}
			
		}		

	});
	
	socket.on("killGame",function(data){
		
		GAMESTATE[1].wolves = 0;
		
	});
	
	socket.on("disconnect",function(){
		
		//remove socket info?  delete from spectators if spectator???
		
	});

});


//PROCESSES GAME INFO
var phase_update = setInterval(function(){
	
	var startTime = Date.now();

	for(var i in GAMESTATE){
	
		var g = GAMESTATE[i];
		
		if(g){

			g.timer--;

			/////////////////////////// CALCULATE VOTES PER SECOND /////////////////////////////
			
			if((g.phase == "Suspect" || g.phase == "Trust") && g.timer != 0){ //if ending sus / trust phase, send votes to everyone
				
				var currSelections = {};
				currSelections[1] = 0;
				currSelections[2] = 0;
				currSelections[3] = 0;
				currSelections[4] = 0;
				currSelections[5] = 0;
				currSelections[6] = 0;
				currSelections[7] = 0;
				currSelections[8] = 0;
				currSelections[9] = 0;
				
				for(var p in g.players){
					
					var p = g.players[p];
					currSelections[p.selection]++;
					
				}
				
				for(var p in g.players){
					
					var p = g.players[p];
					var socket = p.socket;
					if(socket) socket.emit("currSelections",currSelections);
					
				}
				
			}else if(g.phase == "Eliminate"){ //ending eliminate phase, identify eliminated player...
				
				var e = g.eliminator;
				
				if(e != 0){ //if an eliminator is in power
					
					var elimPick = g.players[e].selection;

					for(var p in g.players){ //show his current selection to everyone...
						
						var p = g.players[p];
						var socket = p.socket;
						if(socket) socket.emit("currSelections",elimPick);
						
					}				

				}

			}else if(g.phase == "Night"){
				
				var currSelections = {};
				currSelections[1] = 0;
				currSelections[2] = 0;
				currSelections[3] = 0;
				currSelections[4] = 0;
				currSelections[5] = 0;
				currSelections[6] = 0;
				currSelections[7] = 0;
				currSelections[8] = 0;
				currSelections[9] = 0;
				
				for(var p in g.players){
					
					var p = g.players[p];
					if(p.team == "w")
					currSelections[p.selection]++;
					
				}

				for(var p in g.players){
					
					var p = g.players[p];
					
					if(p.team == "w"){
						
						var socket = p.socket;
						if(socket) socket.emit("currSelections",currSelections);

					}
					
				}					
				
				
			}
			
			
			
			///////////////////////////////////// MAIN LOGIC ///////////////////////////////////////
			
			

			if(g.timer <= 0 && g.game_end == 0){ //timer at 0, game still in progress
				//move game to next phase
				if(g.phase == "Pregame"){ //pregame ended, move to suspects
					
					g.day = 1;
					g.phase = "Day";
					g.timer = 15;
					sendPhase(g);
					
					
				}else if(g.phase == "Day"){

					g.phase = "Suspect";
					g.timer = 15;
					sendPhase(g);					
					
					
				}else if(g.phase == "Suspect"){ //suspects phase ended, process game

					//take selections, update gamestate
					//loop through each player, see who they selected, increment counter.... check accuracy and report to stats also...
					for(var p in g.players){
						
						var p = g.players[p];
						
						if(p.selection != 0){ //they selected someone... go through players to see who they voted for...
						
							var p2 = g.players[p.selection];
							
							g.selections.push({
								day: g.day,
								phase: g.phase,
								voter: p.username,
								voterSeat: p.seat,
								voted_for: p2.username,
								voted_forSeat: p2.seat,
							});
							
							if(p.team == "s"){ //if im on sheep
								
								p.stat_sus_chosen++;
								
								if(p2.team == "w") p.stat_sus_correct++; // and correctly suspected a wolf, track stats...

							}
							
							p.selection = 0;
							p2.suspected++;							

						}
						
					}	
					
					g.phase = "Trust";
					g.timer = 15;					
					sendPhase(g);

				}else if(g.phase == "Trust"){ //Trusted phase ended, process game

					//check who everyone voted for, update variables
					for(var p in g.players){
						
						var p = g.players[p];

						if(p.selection != 0){ //they selected someone... go through players to see who they voted for...
												
							var p2 = g.players[p.selection];
							
							g.selections.push({
								day: g.day,
								phase: g.phase,
								voter: p.username,
								voterSeat: p.seat,
								voted_for: p2.username,
								voted_forSeat: p2.seat,
							});								
						
							if(p.team == "s"){
								
								p.stat_tru_chosen++;
								
								if(p2.team == "s") p.stat_tru_correct++;

							}
							
							p.selection = 0; //unset my choice
							p2.trusted++;
							p2.trustedThisPhase++;
						}
						
					}		

					//find highest "trustedThisPhase" count, to determine eliminator...
					var eliminator = 0;
					var highestTrustedCount = 0;
					
					for(var p in g.players){
						
						var p = g.players[p];
						
						if(p.trustedThisPhase > highestTrustedCount){ //if i have more votes than the last guy, put me on top
							eliminator = p.seat;
							highestTrustedCount = p.trustedThisPhase;							
						}
						
						//COME BACK, if there's a tie between most trusted, decide by OVERALL trust, if that is equal, decide randomly.

						p.trustedThisPhase = 0; //after checking your Trust this phase, set it back to 0

					}

					g.eliminator = eliminator;
					
					g.phase = "Eliminate";
					g.timer = 15;					
					sendPhase(g);	
					
				}else if(g.phase == "Eliminate"){ //Eliminate ended, identify eliminated player
				
					if(g.eliminator != 0){ //if eliminator was voted into power....

						var e = g.players[g.eliminator];
						
						if(e.selection != 0){ //If eliminating someone
							
							g.eliminated = e.selection; //eliminate them
							
							var elimed = g.players[e.selection]; //this is the guy who is dieing
							
							e.selection = 0; //unset after using it
							
							if(e.team == "s"){ //track stats for eliminator if he is a sheep
								e.stat_elim_chosen++;
								if(elimed.team == "w") e.stat_elim_correct++;
							}
							
							
							elimed.alive = 0;
							elimed.eliminated = 1;	
							
							if(elimed.lives > 0) //LOSE LIFE
								if(elimed.lives == 3) db.users.update({username: elimed.username},{$inc:{lives: -1}},{$set: {life_restock: Date.now()}}); //use normal lives first
								else db.users.update({username: elimed.username},{$inc:{lives: -1}}); //use normal lives first																								
							else db.users.update({username: elimed.username},{$inc:{extraLives: -1}}); //use extra lives if out of normal lives
							
							//update scoreboard
							if(elimed.team == "s") g.sheep--; 
							else if(elimed.team == "w") g.wolves--;

						}
					}

					//check for end game...
					if(g.sheep == g.wolves){ //wolves win?
						
						g.winner = "w";
						g.game_end = Date.now();
						endGame(g,"w");
						
					}else if(g.wolves == 0){ //sheep win?
						
						g.winner = "s";
						g.game_end = Date.now();
						endGame(g,"s");
						
					}else{ //keep playing...
						g.phase = "Evening";
						g.timer = 15;
						g.eliminator = 0; //unset eliminator...										
						sendPhase(g);
					}					
									
					
				}else if(g.phase == "Evening"){ //Evening ended
					
					g.hypnotized = 0; //un hypnotize player...
					
					for(var p in g.players){
						
						var p = g.players[p];
						
						if(p.alive == 1){
							
							if(p.role == "Seer"){
								
								//take selection, get role, send it to seer...
								if(p.selection != 0){
									
									var seerPick = g.players[p.selection];
									seerPick.seen = 1;
									g.seen = p.selection;
									g.seenRole = seerPick.role;
									p.selection = 0; //unset
									
								}
								
							}else if(p.role == "Protector" && p.roleCharges > 0){
								
								
								g._protected = p.selection;
								p.selection = 0;


							}else if(p.role == "Trapper" && p.roleCharges > 0){

								g.trapped = p.selection;
								p.selection = 0;							


							}else if(p.role == "Hypnotist" && p.roleCharges > 0){
								
								if(p.selection != 0){
									
									if(g.players[p.selection].team != "w"){ //cant target teammates
										g.hypnotized = p.selection;
										p.selection = 0;
										p.roleCharges = 0; //always works, can only use once
										
									}
									
								}

							}				
							
						}
					
					}
					
					g.phase = "Night"
					g.timer = 15;		
					sendPhase(g);	
					
				}else if(g.phase == "Night"){ //Night ended, find who got eaten...
				
					if(g.recruited != 0){ //recruiting instead of eating...
						
						var p = g.players[g.recruited];
						p.role = "Traitor";
						p.team = "s";		
						
					}else{ //attempting to eat, not recruiting
					
							
						var wolfVotes = []; //get wolf votes, handle multiple votes at random.
						
						for(var i in g.players){
							var p = g.players[i];
							if(p.selection != 0)
								if(p.team == "w" && g.players[p.selection].team != "w"){
									wolfVotes.push(p.selection); //cant vote teammates
									p.stat_eats++;
									if(g.players[p.selection].role != "Sheep" && g.players[p.selection].role != "Traitor") p.stat_spec_eats++; //if hit a good target, up spec eats
									p.selection = 0; //unset wolf selections
								} 
						}
						
						if(wolfVotes.length > 1){
							
							var random = Math.round(Math.random()*wolfVotes.length); //random vote from the votes
							
							console.log("rand " + random);
							console.log("wolfVotes " + JSON.stringify(wolfVotes));
							
							g.eaten = wolfVotes[random];
							
							console.log("geat "+ g.eaten);

						}else if(wolfVotes.length == 1){
							
							g.eaten = wolfVotes[0];
							
						}else{ //wolves did not pick... pick for them randomly?
							
							g.eaten = 0;
							
						}


						//find the wolf target, handle protector trapper etc... change to alive = 0 eaten = 1
						
						if(g.eaten == g._protected){
							
							g.eaten = 0;
							g._protected = 0;

						}else{
							
							if(g.eaten == g.trapped  && g.eaten != 0){ //if trapper successful
								
								if(g.wolves > 1){ //if more than 1 wolf, pick at random
									
									var random = Math.round(Math.random()*2) + 1; //random num between 1 and 2
									for(var p2 in g.players){
										var p2 = g.players[p2];
										if(p2.team == "w" && random == 1){ //if random is 1, skip first wolf
											random = 2;
										}else if(p2.team == "w" && random == 2){ //if random is 2 take first wolf
											p2.alive = 0;
											deadWolf = p2.seat;
											g.wolves--;
											
											if(p2.lives > 0) //LOSE LIFE
												if(p2.lives == 3) db.users.update({username: p2.username},{$inc:{lives: -1}},{$set: {life_restock: Date.now()}}); //use normal lives first
												else db.users.update({username: p2.username},{$inc:{lives: -1}}); //use normal lives first																								
											else	db.users.update({username: p2.username},{$inc:{extraLives: -1}}); //use extra lives if out of normal lives
											
										}
										
									}
									
								}else{
									
									//kill the last wolf...
									for(var p2 in g.players){
										
										var p2 = g.players[p2];
										
										if(p2.team == "w"){
											
											p2.alive = 0;
											g.wolves--;
											deadWolf = p2.seat;
											
											if(p2.lives > 0) //LOSE LIFE
												if(p2.lives == 3) db.users.update({username: p2.username},{$inc:{lives: -1}},{$set: {life_restock: Date.now()}}); //use normal lives first
												else db.users.update({username: p2.username},{$inc:{lives: -1}}); //use normal lives first																								
											else	db.users.update({username: p2.username},{$inc:{extraLives: -1}}); //use extra lives if out of normal lives

											break;
										} 
										
									}
									
								}

							}

							//kill wolf target
							if(g.eaten != 0){
								
								var eaten = g.players[g.eaten];
								eaten.alive = 0;
								eaten.eaten = 1;
								g.sheep--;
								
								if(eaten.lives > 0) //LOSE LIFE
									if(eaten.lives == 3) db.users.update({username: eaten.username},{$inc:{lives: -1}},{$set: {life_restock: Date.now()}}); //use normal lives first
									else db.users.update({username: eaten.username},{$inc:{lives: -1}}); //use normal lives first																								
								else	db.users.update({username: eaten.username},{$inc:{extraLives: -1}}); //use extra lives if out of normal lives									
								
							}							

						}
						
						//check for end game...
						if(g.sheep == g.wolves){ //wolves win?
							
							g.winner = "w";
							g.game_end = Date.now();
							endGame(g,"w");
							
						}else if(g.wolves == 0){ //sheep win?
							
							g.winner = "s";
							g.game_end = Date.now();
							endGame(g,"s");
							
						}else{ //keep playing
							g.phase = "Day"
							g.timer = 15;	
							g.day++;
							sendPhase(g);															
						}

					}
					
					
				}
				
			}
						
		}
	
	}
	
	if(Date.now() - startTime > 3){
		console.log("phaseUpdate " + (Date.now() - startTime));
	}
	
	
},1000);


//SENDS GAME INFO
function sendPhase(g){
	
	var startTime = Date.now();
	
	var pkg = {};
	
	
	//GAME RELATED, role related is next
	pkg.day = g.day;
	pkg.phase = g.phase;
	pkg.timer = g.timer;
	pkg.sheep = g.sheep;
	pkg.wolves = g.wolves;
	
	
	if(g.phase == "Day"){ //starting suspect phase, tell us who was eaten last night... 
		
		//if wolf target was protected, g.eaten was set back to 0 already...
		if(g.day != 1){ //dont check on day 1, because coming from pregame and nobody can be eaten yet...
			pkg.eaten = g.eaten; //0 means nobody was eaten
			pkg.trapped = g.trapped; //0 mean nobody was trapped
			g.eaten = 0; //unset
			g._protected = 0; //unset
		}


	}else if(g.phase == "Trust"){ //starting trust phase, send new suspect counts
		
		pkg.newCounts = [];
		
		for(var i in g.players){
			
			var p = g.players[i];
			
			if(p.alive == 1){  //update vote counts for living players...
				
				pkg.newCounts.push({
					
					seat: p.seat,
					suspected: p.suspected,
					
				});
				
			}
			
		}	

		pkg.selections = g.selections; // send all vote info to add to chat
		g.selections = []; //unset selections
		g.recruited = 0; //unset recruited
		
	}else if(g.phase == "Eliminate"){ //starting eliminate phase, send new trust counts
	
		pkg.newCounts = [];
		
		for(var i in g.players){
			
			var p = g.players[i];
			
			if(p.alive == 1){  //update vote counts for living players...
				
				pkg.newCounts.push({
					
					seat: p.seat,
					trusted: p.trusted,
					
				});
				
			}
			
		}	

		pkg.selections = g.selections; // send all vote info to add to chat
		g.selections = [];
		
		pkg.eliminator = g.eliminator;
		
	}else if(g.phase == "Evening"){
	
		//who was eliminated...
		pkg.eliminated = g.eliminated;
		
	}else if(g.phase == "Night"){
		
		//since each player needs custom package, that is handled below...
		g.eliminated = 0; //unset for next round

	}
	
	
	//CHANGE ROLE RELATED INFORMATION
	for(var i in g.players){

		var p = g.players[i];
		var socket = p.socket;
		
		if(socket){
			
			if(g.phase == "Night"){ //if going to night phase, modify package for special sheep
				
				if(p.role == "Sheep" || p.role == "Traitor" || p.role == "Coroner"){ //send standard package
				
					pkg.seenSeat = 0;
					pkg.seenRole = 0;
					pkg._protected = 0;
					pkg.trapped = 0;
					
				}else{ //these roles get custom packages
					
					if(p.role == "Seer"){ 
						pkg.seenSeat = g.seen;
						pkg.seenRole = g.seenRole;
						pkg.trapped = 0; //unset
						pkg._protected = 0; //unset
						g.seen = 0; //unset
						g.seenRole = "TBD"; //unset
					}else if(p.role == "Protector"){ 
						pkg.seenSeat = 0;
						pkg.seenRole = 0;	
						pkg.trapped = 0;						
						pkg._protected = g._protected;							
					}else if(p.role == "Trapper"){
						pkg.seenSeat = 0;
						pkg.seenRole = 0;		
						pkg._protected = 0;
						pkg.trapped = g.trapped;	
					}else if(p.team == "w"){
						pkg.seenSeat = 0;
						pkg.seenRole = 0;
						pkg._protected = 0;
						pkg.trapped = 0;
						pkg.hypnotized = g.hypnotized;
						
					}

				}

			}else if(g.phase == "Day"){


				if(p.seat == g.recruited){ //notify recruited player that they are recruited, also tell them who wolves are.

					pkg.recruited = 1;
					pkg.wolves = [];
					
					for(var i2 in g.players){
						var p2 = g.players[i2];
						if(p2.team == "w") pkg.wolves.push(p2.seat);
					}
					
				}else if(p.team == "w" && g.recruited != 0){ //all wolves get to know who got recruited	
				
					pkg.recruited = g.recruited;
				
				}
				
				if(p.role == "Coroner"){ //coroner gets extra info about who died
					
					if(g.eaten != 0){ //eaten players can die
						
						for(var i2 in g.players){
							
							var p2 = g.players[i2];
							if(p2.seat == g.eaten){
								pkg.eatenRole = p2.role;
							}else if(p2.seat == g.trapped){ //trapped players can die
								pkg.trappedRole = p2.role;
								
							}
							
						}
						
					}
					
				}
				
				if(p.seat == g.hypnotized){ //notify hypnotized player that they are hypnotized
					pkg.hypnotized = g.hypnotized;
				}

			}else if(g.phase == "Evening"){
				
				for(var i2 in g.players){
					
					var p2 = g.players[i2];
					if(p2.seat == g.eliminated){
						if(p.role == "Coroner") pkg.eliminatedRole = p2.role; //coroner gets full role
						pkg.eliminatedTeam = p2.team;	//everyone else just gets team
						break;
					}
					
				}				

			} 
			
			socket.emit("phaseChange",pkg); //modified before sending by the above...

		}
		
	}
	
	//send pkg to spectators also, if any
	for(var s in g.spectators){
		
		var socket = g.spectators[s];
		socket.emit("phaseChange",pkg);
		
	}
	
	if(Date.now() - startTime > 3){
		console.log("sendPhase " + (Date.now() - startTime));
	}
	
}

function endGame(g,winner){
	
	console.log("ending: w: " + g.wolves + " s: " + g.sheep);
	
	//Create and send a package for each player containing their performance stats for this game
	
	
	//create gameHistory mongoDB doc....
	db.gameHistory.insert({
		
		game_id: g.id,
		day: g.day,
		phase: g.phase,
		end_time: g.game_end,
		sheep: g.sheep,
		wolves: g.wolves,
		winner: winner,
		players: []
		
	});
	
	var gameHistoryPlayers = [];
	
	var allRoles = [];
	
	for(var p in g.players){
		
		var p = g.players[p];
		
		var win = 0;
		p.gamesPlayed++; //using this in next loop for rankings
		
		if(g.winner == p.team && p.role != "Traitor") win = 1; //you win if you're on the winning team, except traitor
		else if(g.winner == "w" && p.role == "Traitor") win = 1; //traitor wins if wolves win...		
		
		allRoles.push({
			username: p.username,
			seat: p.seat,
			team: p.team,
			role: p.role,
			win: win,
		});
		
		gameHistoryPlayers.push({
			
			username: p.username,
			team: p.team,
			role: p.role,
			trusted: p.trusted,
			suspected: p.suspected,
			win: win,
			
		});
		
	}
	
	db.gameHistory.update({game_id: g.id},{$set: {players: gameHistoryPlayers}});

	//update stats individually per player...
	
	for(var p in g.players){
		
		var p = g.players[p];
		var pkg = {};
		var win = 0;
		var newWinStreak = 0;
		var rankCat = 0;
		var rankPoints = p.rankPoints;
		var pointsChange = 0;
		var earnings = 0;
		
		if(p.gamesPlayed == 10){ //if exactly 10th game, place in division
		
			p.rankPoints = 100 + (p.gamesWon * 40); 
			rankCat = -1;
		
		}else if(p.gamesPlayed > 10){ //more than 10 games, calculate rank points normally
			
			if(p.rankPoints >= -10000 && p.rankPoints < 200) rankCat = 1;
			else if(p.rankPoints >= 200 && p.rankPoints < 400) rankCat = 2;
			else if(p.rankPoints >= 400 && p.rankPoints < 600) rankCat = 3;
			else if(p.rankPoints >= 600 && p.rankPoints < 800) rankCat = 4;
			else if(p.rankPoints >= 600 && p.rankPoints < 10000) rankCat = 5;

		}
			
		
		if((g.winner == p.team && p.role != "Traitor")  || (g.winner == "w" && p.role == "Traitor")){ //you win
			
			win = 1;
			p.winStreak++;
			newWinStreak = p.winStreak;
			if(p.winStreak > p.longestWinStreak) p.longestWinStreak = p.winStreak;
			
			if(rankCat > 0){
				p.rankPoints += (23 - rankCat);
				pointsChange = (23 - rankCat);
			}	
			
			
		}else{ //you lose
			
			if(rankCat > 0){
				p.rankPoints -= (17 + rankCat);
				pointsChange = (17 + rankCat);
			} 
			
		}
		
		if(p.team == "s"){ //package and track sheep stats
		
			if(p.role == "Traitor"){  //if traitor, dont track guessing % because you knew everything... track everything else

				pkg = {
					
					phase: "End",
					winner: g.winner,
					suspected: p.suspected,
					trusted: p.trusted,
					winStreak: newWinStreak,
					rankPoints: p.rankPoints,
					rankCat: rankCat,
					gamesPlayed: p.gamesPlayed,
					pointsChange: pointsChange,
					roles: allRoles,

				};	

				db.playerStats.update(
				
					{username: p.username}, 
					{
						$inc: {
							
							s_games: 1,
							s_wins: win,
							s_suspected: p.suspected,
							s_trusted: p.trusted,
							s_games_survived: p.alive,

						}
						
						,$set: {
							
							winStreak: newWinStreak,
							longestWinStreak: p.longestWinStreak,
							rankPoints: p.rankPoints

						}
						
						,$push: {
							
							games: g.id
							
						}
						
					},
					{limit: 1});
					
				earnings = (50 + (win * 100) + (p.winStreak * 10) + 20 + p.trusted); //playing + winning + winStreak + bribe + trust count
			
			}else{ //all non-traitor sheeps...

				pkg = {
					
					phase: "End",
					winner: g.winner,
					suspected: p.suspected,
					trusted: p.trusted,
					winStreak: newWinStreak,
					rankPoints: p.rankPoints,
					rankCat: rankCat,
					gamesPlayed: p.gamesPlayed,
					pointsChange: pointsChange,
					stat_sus_chosen: p.stat_sus_chosen,
					stat_sus_correct: p.stat_sus_correct,
					stat_tru_chosen: p.stat_tru_chosen,
					stat_tru_correct: p.stat_tru_correct,
					stat_elim_chosen: p.stat_elim_chosen,
					stat_elim_correct: p.stat_elim_correct,	
					roles: allRoles,				

				};	

				db.playerStats.update(
				
					{username: p.username}, 
					{
						$inc: {
							
							s_games: 1,
							s_wins: win,
							s_sus_chosen: p.stat_sus_chosen,
							s_sus_chosen_correct: p.stat_sus_correct,
							s_tru_chosen: p.stat_tru_chosen,
							s_tru_chosen_correct: p.stat_tru_correct,
							s_elim_chosen: p.stat_elim_chosen,
							s_elim_correct: p.stat_elim_correct,
							s_suspected: p.suspected,
							s_trusted: p.trusted,
							s_games_survived: p.alive,

						}
						
						,$set: {
							
							winStreak: newWinStreak,
							longestWinStreak: p.longestWinStreak,
							rankPoints: p.rankPoints

						}
						
						,$push: {
							
							games: g.id
							
						}						
						
					},
					{limit: 1});
					
				earnings = (50 + (100 * win) + (p.winStreak * 10) + (p.stat_elim_correct * 25) + (p.stat_sus_correct * 2)); //playing + winning + winStreak + elimWolves + susWolves
			
			}
			
		}else{ //package and track wolf stats
			
			pkg = {
				
				phase: "End",
				winner: g.winner,
				suspected: p.suspected,
				trusted: p.trusted,
				winStreak: newWinStreak,
				rankPoints: p.rankPoints,
				rankCat: rankCat,
				gamesPlayed: p.gamesPlayed,
				pointsChange: pointsChange,
				stat_eats: p.stat_eats,
				stat_spec_eats: p.stat_spec_eats,	
				roles: allRoles,
		
			};

			db.playerStats.update(
			
				{username: p.username}, 
				{
					$inc: {
						
						w_games: 1,
						w_wins: win,
						w_eats: p.stat_eats,
						w_spec_eats: p.stat_spec_eats,
						w_suspected: p.suspected,
						w_trusted: p.trusted,
						w_games_survived: p.alive
					
					}
					
					,$set: {
						
						winStreak: newWinStreak,
						longestWinStreak: p.longestWinStreak,
						rankPoints: p.rankPoints

					}
					
					,$push: {
						
						games: g.id
						
					}					
					
				},
				{limit: 1});
				
			earnings = (50 + (100 * win) + (p.winStreak * 10) + (p.stat_spec_eats * 10) + p.trusted); //playing + winning + elimWolves + susWolves

		}

		if(p.karma < 25){ //up karma by 1 each game
			
			p.karma++;
			db.users.update({username: p.username},{$inc: {gold: earnings}},{$set: {karma: p.karma}});	
		
		}else{
			
			db.users.update({username: p.username},{$inc: {gold: earnings}});
		
		}
		
		var socket = p.socket;
		if(socket) socket.emit("phaseChange",pkg);
		
		
		
	}
	
	//make basic package for spectators...
	var spectatorPkg = {
		phase: "End",
		winner: g.winner,
		roles: allRoles,
	};	
	
	//send to spectators
	for(var s in g.spectators){
		
		var socket = g.spectators[s];
		if(socket)	socket.emit("phaseChange",spectatorPkg);
			
	}

	//delete game after one minute to allow chatting...
	var destroy = setTimeout(function(){ delete GAMESTATE[g.id]; },60000); 
	//delete GAMESTATE[g.id];

	//COME BACK
	//destroy mongoDB gamestate records
	//db.gamestate.remove

}

//queue status 0 = default, status 1 = waiting for players to accept, status 2 = game created, status -1 = someone declined / didnt accept

//QUEUE SYSTEM

//LOBBY = {};

//QUEUE = [] example; [{size: 1, status: 0, leader: "ian", players: [{username: "ian", accepted: 0, boost: 0}]}]
//QUEUE = [] example; [{size: 3, status: 0, leader: "TED", players: [{username: "TED", accepted: 0, boost: 0},{username: "tyler", accepted: 0, boost: 0},{username: "nick", accepted: 0, boost: 0}]}]
//QUEUE = [] example; [{size: 2, status: 0, leader: "Someone", players: [{username: "Someone", accepted: 0},{username: "someoneelse"}]}]

//PREGAME = [] example; [{size: 0, accepted: 0, pending: 0, fillTime: 12345678, gameCreated: 0, queues: ["leader1","leader2","etc.."]
//PREGAME  = []example; [{size: 9, accepted: 5, pending: 1, fillTime: 12345678, gameCreated: 0, queues: ["leader1","leader2","etc.."]

var queueLoop = setInterval(function(){	
		
	for(var i = 0; i < PREGAME.length; i++){ //check pregames to see how many players needed
		
		var pg = PREGAME[i];
		
		if(pg.size < 9 && pg.pending == 0){ //if pregame isnt full yet, look for players
			
			var needed = 9 - pg.size; //how many players to look for
			
			for(var i2 = 0; i2 < QUEUE.length; i2++){ //example, need 3, go through queue looking for groups of 3 or less
				
				var q = QUEUE[i2];
				
				if(q.status == 0){ //if group not reserved already
					
					if(q.size <= needed){ //push that group into PREGAME and reserve
						
						q.status = 1;
						pg.queues.push(q.leader); 
						pg.size += q.size;
						needed -= q.size;
						
						if(pg.size == 9){ //if 9 players are in the group, set pending to 1... which the client is looking for via /ajax/checkQueue
							
							pg.pending = 1;
							pg.fillTime = Date.now(); //tag time
							break;
							
						}

					}

				}
				
			}
			
		}else if(pg.size == 9 && pg.pending == 1){ //if the game is full and waiting for players to accept...

			if(pg.accepted == 9){ //if 9 players accepted a game, make a game for them
				
				//9 players accepted a game, do something: createGame(pg)?	
				console.log("MAKING GAME" + JSON.stringify(pg));
				
			}else{ //9 players didn't accept yet, either keep waiting or kick queues who didnt accept
				
				if((Date.now() - pg.fillTime) / 1000 > 15){ //if 15 seconds have gone by waiting, kick non-accepting group out, notify who didnt accept
					
					
					

				}
				
			}

		}

	}		

	
},3000);



app.get("/ajax/joinSoloQueue",function(req,res){
	
	var username = req.session.username;
	var boost = req.query.boost;

	db.users.find({username_lc: username},{karma: 1, cooldown: 1, boosts: 1, lives: 1, extraLives: 1, life_restock: 1},{limit: 1},function(err,docs){
		
		docs.forEach(function(u){
			
			karma = u.karma;
			cooldown = u.cooldown
			myBoosts = u.boosts; 
			lives = u.lives;
			extraLives = u.extraLives;
			lifeRestock = u.life_restock;
			
		});
		
		if(myBoosts == 0) boost = ""; //make sure no haxorz stealing boosts
		
		if(cooldown == 0){ //if not on cooldown
			
			if(lives > 0 || extraLives > 0){ //if you have lives
				
				db.users.update({username_lc: username},{$set:{status: "In Queue"}});
				QUEUE.push({size: 1, status: 0, leader: username, players: [{username: username, accepted: 0, boost: boost}]});
				res.send("in~in");
				
			}else{
				
				//find out next life restock time...
				var restockTime = ((86400000) - (Date.Now() - lifeRestock)); // 1 day minus how long you've waited since losing 3rd life
				res.send("restock~" + restockTime);
				
			}
			
		}else{
			
			res.send("cooldown~" + cooldown);
			
		}
		
	});
	
});

app.get("/ajax/joinGroupQueue",function(req,res){
	
	

});

app.get("/ajax/checkQueue",function(req,res){
	
	//var username = session username
	//var leader = req.query.leader;
	
	
});

app.get("/ajax/acceptGame",function(req,res){

	//var username = session username
	//var leader = req.query.leader;	
	
	
	

	
});



//HASHING PASSWORDS
//received username + password
//var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
//if(bcrypt.compareSync(password,hashedPW){"matches"}else{"doesnt match"}

//LOGIN PAGE
app.get("/",function(req, res){
	
	//req.session.destroy();
	if(req.session.username){

		db.users.find({username_lc: req.session.username},function(err,docs){
			
			if(docs.length > 0){	
				console.log(req.session.username + " active session, redirected to ui");
				res.redirect("/ui");
			}else{
				console.log("Session mismatch: " + req.session.username);	
				res.render("login");
			}

		});
		
	}else{
		res.render("login");
	}

});

app.get("/ui",function(req,res){
	
	//check session
	var username = req.session.username;
	console.log(username);
	
	db.users.find({username_lc: username},{username: 1, gold: 1, lives: 1, extraLives: 1, life_restock: 1, cooldown: 1, boosts: 1, skins: 1, head: 1, eyes: 1, face: 1, body: 1, feet: 1},{limit: 1},function(err,docs){

		if(docs.length > 0){
			
			//get case sensitive username and render page with necessary info
			docs.forEach(function(u){
				username = u.username;
				gold = u.gold;
				lives = u.lives;
				extraLives = u.extraLives;
				lifeRestock = u.life_restock;
				cooldown = u.cooldown;
				boosts = u.boosts;
				skins = u.skins;
				head = u.head;
				eyes = u.eyes;
				face = u.face;
				body = u.body;
				feet = u.feet;
			});
			
			//if lives < 3, and it's been 24 hours since restock time.. set lives back to 3...
			if(lives < 3){
				var timeUntilRestock = ((86400000) - (Date.now() - lifeRestock));
				if(timeUntilRestock <= 0)
					db.users.update({username_lc: username},{$set:{lives: 3}});
			}
			
			if(cooldown > 0){
				if(Date.now() > cooldown)
					db.users.update({username_lc: username},{$set:{cooldown: 0}});
				
			}
			
			//update status to online when loading this page
			db.users.update({username_lc: username},{$set: {status: "Online"}});
			
			lives = lives + extraLives;
			
			res.render("ui",{
				username: username,
				gold: gold,
				lives: lives,
				lifeRestock: lifeRestock,
				cooldown: cooldown,
				boosts: boosts,
				skins: skins,
				head: head,
				eyes: eyes,
				face: face,
				body: body,
				feet: feet,				
				
			});	
					
		}else{
			res.redirect("/");		
		}
		
	});
	
});



app.get("/game/:gameID/:seat/:randID",function(req,res){
	
	//check session
	
	//when loading this page make sure that the player is logged in
	//check db to see which game they are in, make sure they're in the right one.
	//if they are trying to spectate the game, then update their status to spectating + game_id..
	//you can only be playing or spectating 1 game at a time.
	var ip = req.connection.remoteAddress;
	console.log("IP from express " + ip);
	var username = req.session.username;
	console.log(username);
	
	db.users.find({username_lc: username},{username: 1},{limit: 1},function(err,docs){ //make sure your username exists...
	
		if(docs.length > 0){
			
			var game_id = req.params.gameID;
			var rand_id = req.params.randID;
			var seat = req.params.seat;
			
			console.log("RAND ID FROM EXP " + rand_id + " " + game_id + " " + seat);
			
			docs.forEach(function(u){
				username = u.username;
			});
			
			
			
			var g = GAMESTATE[game_id];
			
			if(g){ //make sure the game you're trying to connect to exists...

				if(rand_id = "spectate"){ //if trying to connect as spectator, validate that you're not a player trying to cheat, or mis-navigated
					
					var found = 0;
					
					for(var p in g.players){
						
						var p = g.players[p];
						if(p.username == username && p.alive == 1){ //if found in a game alive... fix the rand id
							
							rand_id = p.id;
							found = 1;
							break;
							
						}
						
					}
								
				}
			
				res.render("game",{
					username: username,
					rand_id: rand_id,
					game_id: game_id,
					seat: seat,
				});
			
			}else{
				
				//LOOK FOR THE GAME IN HISTORY.. IF FOUND LOAD A PAGE WITH THE SUMMARY OF THAT GAME
				//IF NOT FOUND, TELL THEM GAME ID DOESNT EXIST.. OR SOMETHING
				res.redirect("/"); //REMOVE THIS LINE.. do the above 2 lines instead..
				
			}
			
		}else{
			res.redirect("/");
		}
		
	});
	
});


app.get("/logout",function(req,res){

	console.log(req.session.username + " logged out");
	req.session.destroy();
	res.redirect("/");
	
});


/////////////////////////////////////////////////////////////    AJAX     ///////////////////////////////////////////////////
app.get("/ajax/login",function(req,res){
	
	//if not from ajax command redirect to bad route????
	
	
	//TO STRING, to make sure people dont type in functions to the input boxes?
	//CONVER TO LOWER CASE AND SEARCH ON THAT...
	var username = req.query.username;
	var username_lc = username.toLowerCase();
	var password = req.query.password;
	var hashed;
	
	db.users.find({username_lc: username_lc},{password: 1, _id: 0},{limit: 1},function(err,docs){
	
		if(docs.length > 0){	
		
			docs.forEach(function(pw){
				hashed = pw.password;
			});
		
			//compare password
			if(bcrypt.compareSync(password,hashed)){
				req.session.username = username_lc;
				res.send("/ui"); //client js will redirect them to this		
			}else{
				res.send("0");	//user doesnt exist	
			}
			
		}else{
			res.send("0");	//user doesnt exist
		}
		
	});
	
});

app.get("/ajax/signup",function(req,res){

	var username = req.query.username;
	var username_lc = username.toLowerCase();
	var password = req.query.password;
	var password2 = req.query.password2;
	var email = req.query.email;
	var email_lc = email.toLowerCase();
	
	db.users.find({username_lc: username_lc},{limit: 1},function(err,docs){  //if username not taken
		if(docs.length == 0){
			
			db.users.find({email_lc: email_lc},function(err,docs){ //if email not taken
				if(docs.length == 0){
					
					if(password == password2){ //passwords are matching
						
						if(password.length > 6 && password.length < 20){ //passwords are legit
							
							if(email.indexOf("@") > -1 && email.indexOf(".") > -1){ //email is legit
								//INSER THEM TO DB AND EMAIL THEM
								//BCRYPT THE PASSWORD
								//MAKE TOKEN FOR EMAIL
								var signup_token = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
								var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
								
								db.users.insert({
									username: username,
									username_lc: username_lc,
									password: hash,
									email: email,
									email_lc: email_lc,
									signup_token: signup_token,
									failed_logins: 0,
									gold: 0,
									status: "Offline",
									karma: 25,
									cooldown: Date.now(),
									head: "",
									eyes: "",
									face: "",
									body: "",
									feet: "",
									friends: [],
									groups: [],
									skins: [],
									boosts: [],
									lives: 3,
									extraLives: 0,
									life_restock: 0,
									currGame: 0,
									profilePic: "",
									
								});
								
								db.playerStats.insert({
									username: username,
									username_lc: username_lc,
									games: [],
									winStreak: 0,
									longestWinStreak: 0,
									s_games: 0,
									s_wins: 0,
									s_sus_chosen: 0,
									s_sus_chosen_correct: 0,
									s_tru_chosen: 0,
									s_tru_chosen_correct: 0,
									s_elim: 0,
									s_elim_correct: 0,
									s_games_survived: 0,
									s_suspected: 0,
									s_trusted: 0,
									w_games: 0,
									w_wins: 0,
									w_eats: 0,
									w_spec_eats: 0,
									w_games_survived: 0,
									w_suspected: 0,									
									w_trusted: 0,
									reports_received: 0,
									reports_sent: 0,
									rank: "Unranked", //at 10 games, calculate win %, place in middle somewhere....
									rankPoints: 0, //between 0-100, at 100 you rank up.... earn / lose between 15-25 each game. 									
								});
								
								res.send("account_created");
								
							}else{
								res.send("bad_email");
							}
							
						}else{
							res.send("bad_password");
						}
						
					}else{
						res.send("password_unmatch");
					}
					
				}else{
					res.send("email_taken");
				}
			});
			
		}else{
			res.send("username_taken");
		}
	});
	
});

/*
app.get("/ajax/friends",function(req,res){
	
	
	var username = req.query.username;
	var token = req.session.token;
	
	db.users.find({username: username},{friends: 1, _id: 0},function(err,docs){

		var strDocs = JSON.stringify(docs);
		//results looks like this: [{"friends":["tyler","TeD"]}]
		strDocs = strDocs.replace(/"/g,"");
		var strlen = strDocs.length;
		strDocs = strDocs.substr(11,strlen-14);
		var myFriends = strDocs.split(",");	

			
		db.users.find({username: {$in: myFriends}},{username: 1, status: 1, _id: 0},function(err,docs){
			
			res.send(JSON.stringify(docs));
			
		});

	});

});

*/

app.get("/ajax/stats",function(req,res){
	
	var username = req.session.username;
	
	db.playerStats.find({username_lc: username}).toArray(function(err,docs){
		
		var jInfo = JSON.stringify(docs);
		res.send(jInfo);
		//res.json(docs);
		
	});
	

});

app.get("/ajax/history",function(req,res){
	
	var username = req.session.username;
		
	db.playerStats.find({username_lc: username},{games: 1, _id: 0},{limit: 1},function(err,docs){
		
		var myGames = [];
		docs.forEach(function(u){
			myGames = u.games;
		});
		
		
		//var strDocs = JSON.stringify(docs); //"games": [1,2,3], etc as a STRING
		//var strLen = strDocs.length;
		//strDocs = strDocs.substr(11,strLen-14);	
		//var myGames = JSON.parse("[" + strDocs + "]"); //convert to [1,2,3] array
		
		if(myGames.length > 0){

			db.gameHistory.find({game_id: {$in: myGames}}).sort({end_time: -1}).limit(20,function(err,docs){
				
				//console.log("json3 " + JSON.stringify(docs));
				var jDocs = JSON.stringify(docs);
				res.send(jDocs);
				
			});		
			
		}else{
			
			res.send("No Games");
			
		}

	});		
	
});

app.get("/ajax/inventory",function(req,res){
	
	var username = req.session.username;
	
});


app.get("/ajax/store",function(req,res){
	
	//types: lives: boosts: gold: skins:
	//send everything to the user... compare against already owned skins on client side.
	db.store.find({type: {$in: ["skin","boost"]}},{sold: 0}).toArray(function(err,docs){
		
		var j = JSON.stringify(docs);
		res.send(j);
		
	});
	
	
});

app.get("/ajax/buy",function(req,res){
	
	var username = req.session.username;
	var itemName = req.query.itemName;
	
	db.users.find({username_lc: username},{gold: 1},{limit: 1},function(err,docs){ //validate my gold
	
		if(docs.length > 0){

			docs.forEach(function(u){
				gold = u.gold;
			});
			
			db.store.find({name: itemName},{price: 1},{limit: 1},function(err,docs){ //validate price
			
				if(docs.length > 0){

					docs.forEach(function(u){
					
						price = u.price;
					
					});
					
					if(gold >= price){ //if you have enough gold, buy item
						
						var newGold = gold - price;
						var strNewGold = newGold.toString();
						db.users.update({username_lc: username},{$set: {gold: newGold}, $push: {skins: itemName}},{multi: false});
						res.send(strNewGold);

					}else{ //do nothing.
						
						res.send("e");
						
					}

				}else{
					
					res.send("e");
					
				}

			});		
			
		}else{
			
			res.send("e");
			
		}
		
	});
	
});



app.get("/ajax/invite",function(req,res){

	var username = req.session.username;
	var to = req.query.to;
	var lcTo = to.toLowerCase();
	var type = req.query.type;
	
	db.users.find({username: lcTo},{username: 1},{limit: 1},function(err,docs){
		
		if(docs.length > 0){ //if user exists
		
			if(ALERTS[lcTo]) ALERTS[lcTo].push({sender: username, type: type}); //if object exists, add to it.
			else ALERTS[lcTo] = [{sender: username, type: type}]; //if object doesnt exist, create it

		}else{ //user doesnt exist
			
			res.send(lcTo + "doesn't exist");
			
		}
		
	});	
	
});

app.get("/ajax/setCharacter",function(req,res){
	
	var username = req.session.username;
	var head = req.query.head;
	var eyes = req.query.eyes;
	var face = req.query.face;
	var body = req.query.body;
	var feet = req.query.feet;
	
	//validate that you own them all????
	//find my skins from database...
	
	db.users.find({username_lc: username},{skins: 1},{limit: 1},function(err,docs){
		
		if(docs.length > 0){ //session is legit
			
			docs.forEach(function(u){
				mySkins = u.skins;				
			});
			
			if(head != ""){ //if trying to set a prop, check if owned
				
				var found = 0;
				
				for(var i = 0; i < mySkins.length; i++){
					
					if(mySkins[i] == head){
						found = 1; 
						break;
					} 
					
				}
				
				if(found == 0) head = ""; //if you don't own the skin, then unset your skin
				
			}
			
			if(eyes != ""){ //if trying to set a prop, check if owned
				
				var found = 0;
				
				for(var i = 0; i < mySkins.length; i++){
					
					if(mySkins[i] == eyes){
						found = 1; 
						break;
					} 
					
				}
				
				if(found == 0) eyes = ""; //if you don't own the skin, then unset your skin
				
			}

			if(face != ""){ //if trying to set a prop, check if owned
				
				var found = 0;
				
				for(var i = 0; i < mySkins.length; i++){
					
					if(mySkins[i] == face){
						found = 1; 
						break;
					} 
					
				}
				
				if(found == 0) face = ""; //if you don't own the skin, then unset your skin
				
			}

			if(body != ""){ //if trying to set a prop, check if owned
				
				var found = 0;
				
				for(var i = 0; i < mySkins.length; i++){
					
					if(mySkins[i] == body){
						found = 1; 
						break;
					} 
					
				}
				
				if(found == 0) body = ""; //if you don't own the skin, then unset your skin
				
			}

			if(feet != ""){ //if trying to set a prop, check if owned
				
				var found = 0;
				
				for(var i = 0; i < mySkins.length; i++){
					
					if(mySkins[i] == feet){
						found = 1; 
						break;
					} 
					
				}
				
				if(found == 0) feet = ""; //if you don't own the skin, then unset your skin
				
			}

			db.users.update({username_lc: username},{$set: {head: head, eyes: eyes, face: face, body: body, feet: feet}});
			
			res.send("1");

		}
		
	});
	
	
	
	
	
	
	
	
	
	
});


app.get("/ajax/alerts",function(req,res){
	
	var username = req.session.username;
	
	if(ALERTS[username]){ //if I have alerts, send them to me, then delete them.

		res.send(JSON.stringify(ALERTS[username].alerts));
		
		delete ALERTS[username];
		
	}else{

		res.send("0");
		
	}

});




app.get("*",function(req, res){
	
	res.send("bad route");
	
});

/*

*/



