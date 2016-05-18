var express = require("express");
var app = express();
app.set("view engine","ejs");
var serv = require("http").Server(app);
serv.listen(2000);
var mongojs = require("mongojs");
var db = mongojs("db",["users","store","gamestate"]);
var bodyParser = require("body-parser");
var session = require("client-sessions");
var bcrypt = require("bcryptjs"); 

//var init_cluster = require("./cluster.js");

var ss = require("./server/serverscript.js"); //including other javascript files from server folder

var io = require("socket.io")(serv,{});

var SPECTATORS = {};
var GAMESTATE = {};

console.log("Server Started");





//TSETING AREA ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var modelW = 120;  //all characters are same width and height
var modelH = 120;

var levelW = 3600; //only one size level
var levelH = 3600;


//GENERATE GAMESTATES HERE...



GAMESTATE[1] = {
	
	id: 1,
	map: 1,
	day: 0,
	phase: "Pregame",
	timer: 3,
	host: "ian",
	start_time: Date.now(),
	end_time: 0,
	players: {},
	entities: {},

};

GAMESTATE[1].players[55555] = {
	
	id: 55555,
	public_id: 555555,
	username: "ian",
	type: "W",
	x: 250,
	y: 250,
	d: 3, //4 directions (1 = N),(2 = E),(3 = S),(4 = W)
	m: 0, //moving (1 or 0)
	reqX: 0, //calcualted by sockets.on(keypress, receives header, then calculates)
	reqY: 0, //^^^
	v: 400, //vision
	s: 30, //pixels moved per frame processed
	//height and width?
	grid: 0,

};


GAMESTATE[1].players[44444] = {
	
	id: 44444,
	public_id: 44444,	
	username: "tyler",
	type: "S",	
	x: 350,
	y: 350,
	d: 3,
	m: 0,	
	reqX: 0,
	reqY: 0,	
	v: 350,
	s: 20,
	grid: 0,	
	
};

GAMESTATE[1].players[33333] = {
	
	id: 33333,
	public_id: 33333,	
	username: "TeD",
	type: "S",	
	x: 150,
	y: 150,
	d: 3,
	m: 0,	
	reqX: 0,
	reqY: 0,	
	v: 250,	
	s: 20,
	grid: 0,	
	
};

GAMESTATE[1].players[22222] = {
	
	id: 22222,
	public_id: 22222,	
	username: "P4",
	type: "S",	
	x: 120,
	y: 120,
	d: 3,
	m: 0,	
	reqX: 0,
	reqY: 0,	
	v: 250,	
	s: 8,
	grid: 0,	
	
};

GAMESTATE[1].players[11111] = {
	
	id: 11111,
	public_id: 11111,	
	username: "P5",
	type: "S",	
	x: 130,
	y: 130,
	d: 3,
	m: 0,	
	reqX: 0,
	reqY: 0,	
	v: 250,	
	s: 8, 
	grid: 0,	
	
};

GAMESTATE[1].players[66666] = {
	
	id: 66666,
	public_id: 66666,	
	username: "P6",
	type: "S",	
	x: 190,
	y: 190,
	d: 3,
	m: 0,	
	reqX: 0,
	reqY: 0,	
	v: 250,	
	s: 8, 
	grid: 0,	
	
};

GAMESTATE[1].players[77777] = {
	
	id: 77777,
	public_id: 77777,	
	username: "P7",
	type: "W",	
	x: 180,
	y: 180,
	d: 3,
	m: 0,	
	reqX: 0,
	reqY: 0,	
	v: 300,	
	s: 8, 
	grid: 0,	
	
};

GAMESTATE[1].players[88888] = {
	
	id: 88888,
	public_id: 88888,	
	username: "P8",
	type: "S",	
	x: 170,
	y: 170,
	d: 3,
	m: 0,	
	reqX: 0,
	reqY: 0,	
	v: 250,	
	s: 8,
	grid: 0,	
	
};

GAMESTATE[1].players[99999] = {
	
	id: 99999,
	public_id: 99999,	
	username: "P9",
	type: "S",	
	x: 160,
	y: 160,
	d: 3,
	m: 0,	
	reqX: 0,
	reqY: 0,	
	v: 250,	
	s: 8,
	grid: 0,	
	
};

GAMESTATE[1].entities[12345] = {
	id: 12345,
	public_id: 12345,
	type: "I",	
	x: 225,
	y: 225,
}

var gc = 2;
while(gc < 30){
	
	GAMESTATE[gc] = {
		
		id: gc,
		map: 1,		
		day: 0,
		phase: "Pregame",
		timer: 3,
		host: "ian",
		start_time: Date.now(),
		end_time: 0,
		players: {},
		entities: {},

	};
	
	var pc = 1;
	while(pc < 9){

		GAMESTATE[gc].players[pc] = {
			
			id: pc,
			username: "random",
			public_id: 1,
			type: "sheep",
			x: 500,
			y: 500,
			d: 3,
			m: 0,
			reqX: 0,
			reqY: 0,			
			v: 400,
			s: 15, //speed x 8 = pixels per second			
		};	
		
		pc++;
		
	}

	var oc = 1;
	while(oc < 5){
		
		GAMESTATE[1].entities[12345] = {
			id: 12345,
			type: "speedboost",	
			public_id: 20,
			x: 425,
			y: 425,
		}

		oc++;
		
	}

	
	gc++;
}


/*


*/

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


io.use(function(socket,next){
	
	//console.log("socket use");
	
	var rand_id = parseInt(socket.handshake.query.rand_id);
	
	if(rand_id == "spectate"){
		
		//push into spectators, then next
		return next();
		
	}else{
		
		
		//console.log("socket id received " + rand_id);
		db.gamestate.find({rand_id: rand_id},{},{limit: 1},function(err,docs){
			
			//console.log("docs length " + docs.length);
			
			if(docs.length > 0){
				
				//add check to see if they're banned... either create connection or reject.
				
				var game_id;
				docs.forEach(function(doc){
					game_id = doc.game_id;
				});

				
				console.log("game_id " + game_id);
				//update socket data for that player..
				GAMESTATE[game_id].players[rand_id].socket = socket;
				//console.log(GAMESTATE[game_id].players[rand_id]);
				return next();
				
			}else{
				
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
	
	socket.on("changeDir",function(data){
		
		//console.log(Date.now());
		//count move requests / disconnect socket if spamming too hard to prevent DoS attack?

		
		switch(data.h){
			case "0":
				GAMESTATE[data.game_id].players[data.rand_id].reqX = 0;
				GAMESTATE[data.game_id].players[data.rand_id].reqY = 0;
				GAMESTATE[data.game_id].players[data.rand_id].m = 0;	
				break;
			case "n":
				GAMESTATE[data.game_id].players[data.rand_id].reqX = 0;
				GAMESTATE[data.game_id].players[data.rand_id].reqY = -1;
				GAMESTATE[data.game_id].players[data.rand_id].m = 1;	
				GAMESTATE[data.game_id].players[data.rand_id].d = 1;					
				break;				
			case "e":
				GAMESTATE[data.game_id].players[data.rand_id].reqX = 1;
				GAMESTATE[data.game_id].players[data.rand_id].reqY = 0;
				GAMESTATE[data.game_id].players[data.rand_id].m = 1;	
				GAMESTATE[data.game_id].players[data.rand_id].d = 2;				
				break;				
			case "s":
				GAMESTATE[data.game_id].players[data.rand_id].reqX = 0;
				GAMESTATE[data.game_id].players[data.rand_id].reqY = 1;
				GAMESTATE[data.game_id].players[data.rand_id].m = 1;	
				GAMESTATE[data.game_id].players[data.rand_id].d = 3;					
				break;				
			case "w":
				GAMESTATE[data.game_id].players[data.rand_id].reqX = -1;
				GAMESTATE[data.game_id].players[data.rand_id].reqY = 0;
				GAMESTATE[data.game_id].players[data.rand_id].m = 1;	
				GAMESTATE[data.game_id].players[data.rand_id].d = 4;					
				break;
			case "ne":
				GAMESTATE[data.game_id].players[data.rand_id].reqX = 1;
				GAMESTATE[data.game_id].players[data.rand_id].reqY = -1;
				GAMESTATE[data.game_id].players[data.rand_id].m = 1;	
				GAMESTATE[data.game_id].players[data.rand_id].d = 2;					
				break;
			case "nw":
				GAMESTATE[data.game_id].players[data.rand_id].reqX = -1;
				GAMESTATE[data.game_id].players[data.rand_id].reqY = -1;
				GAMESTATE[data.game_id].players[data.rand_id].m = 1;	
				GAMESTATE[data.game_id].players[data.rand_id].d = 4;					
				break;
			case "se":
				GAMESTATE[data.game_id].players[data.rand_id].reqX = 1;
				GAMESTATE[data.game_id].players[data.rand_id].reqY = 1;		
				GAMESTATE[data.game_id].players[data.rand_id].m = 1;	
				GAMESTATE[data.game_id].players[data.rand_id].d = 2;					
				break;
			case "sw":
				GAMESTATE[data.game_id].players[data.rand_id].reqX = -1;
				GAMESTATE[data.game_id].players[data.rand_id].reqY = 1;		
				GAMESTATE[data.game_id].players[data.rand_id].m = 1;	
				GAMESTATE[data.game_id].players[data.rand_id].d = 4;					
				break;
		}
		
		
		
	});	
	
	socket.on("chatMessage",function(data){
		
		//FILTER OUT SWEAR WORDS AND SHIT, FUCK
		
		//only allow X messages per second, monitored by client also...
		
		//SEND TO ERRBODY IN THAT GAME (save backup? in mongo? in variable?)
		//data. GAME ID
		//data. rand_id
		//data. message
		//data. timestamp
		//data. 
	});
	
	
	
});


	



var phase_update = setInterval(function(){
	
	var gameLoopTime = Date.now();

	for(var i in GAMESTATE){
	
		var g = GAMESTATE[i];
		if(g){

			g.timer--;

			if(g.timer <= 0){
				//move game to next phase
				if(g.phase == "Pregame"){
					g.day = 1;
					g.phase = "Day";
					g.timer = 6000;
				}else if(g.phase == "Day"){
					g.phase = "Suspect";
					g.timer = 600;
				}else if(g.phase == "Suspect"){
					g.phase = "Trust";
					g.timer = 600;
				}else if(g.phase == "Trust"){
					g.phase = "Eliminate";
					g.phase = 600;
				}
			}
			
			for(var i2 in g.players){
				//console.log("SOCKET INFO " + GAMESTATE[i].players[i2].socket);
				//console.log("SOCKET INFO 2 " + GAMESTATE[i].players[i2].username);
				var socket = g.players[i2].socket;
				
				if(socket){
					socket.emit("gamestate",{
						day: g.day,
						phase: g.phase,
						timer: g.timer
					});			
				}

			}
			
		}
	
	}
	
	//console.log(GAMESTATE[1].players[55555].pressRight);

	
	
},1000);






var sendPositions = setInterval(function(){
	
	//var gameLoopTime = Date.now();
	
	//REGISTER PLAYER KEYBOARD TAPS... if a player taps left, we should move them left once regardless
	
	//DO ALL MOVEMENTS, CALCULATE AGAINST PREVIOUS GAMESTATE??


	//THEN CALCULATE ALL COLLISSIONS???
	
	//DONT SHOW TO SPECTATORS... (maybe show a log of the events only... to prevent ghosting)
	for(var i in GAMESTATE){
	
		var g = GAMESTATE[i];
		
		//if(g.phase == "Night"){  //put line back in so only calculating during night time
		if(g.phase){
		
			//MOVE PLAYERS BASED ON WHAT THEY GAVE US
			
			for(var i1 in g.players){

				var p = g.players[i1];
				var newX = p.x + (p.reqX * p.s);   //move speed * direction
				var newY = p.y + (p.reqY * p.s); 
					
				//if trying to move, check terrain collissions
				
				/*
				//test x first... (cant do simultaneously, in case going nw against flat wall, need to move n or w)
				if(p.reqX != 0){
					
					switch(g.map){
						
						case 1:

							//determine area
							
							//based on area, check for collission for known terrain
							
							
							
						
						
						
						
						
						
						
							if(newX > levelW - modelW) p.x = levelW - modelW;
							else if(newX < 0) p.x = 0;
							else p.x = newX;	

















							

							break;
						case 2:
							//do something
							break;
						case 3:
							//do something
							break;
						case 4:
							//do something
							break;
						case 5:
							//do something
							break;			
						
						
						
					}					
					
					
					
					
				}

				
				//test y
				if(p.reqY != 0){
					
					switch(map){
						
						case 1:

							if(newY > levelH - modelH) p.y = levelH - modelH; //insert Y boundaries here
							else if(newY < 0) p.y = 0;
							else p.y = newY;				

							break;
						case 2:
							//do something
							break;
						case 3:
							//do something
							break;
						case 4:
							//do something
							break;
						case 5:
							//do something
							break;			
						
						
						
					}					
					
					
				}
					
					
					
			
				
				//check which grid you're in... then switch statement 1-9 grids
				
				
				
				*/
				
				

			}

			//CREATE NEW PACKAGES AFTER PLAYER MOVES HAVE BEEN PROCESSED
			for(var i2 in g.players){
				
				var pkg = [];
				
				//get self position first, then all other entities
				var self = g.players[i2];
				var socket = g.players[i2].socket;
				
				//ADD "EVENTS" TO THE GAMESTATE PKG?
				pkg.push({
					type: self.type,
					public_id: self.public_id,
					x: self.x,
					y: self.y,
					v: self.v, 
					s: self.s,
					d: self.d,
					m: self.m,
					//display any buffs / debuffs, or visual effects?
				});					
				
				for(var pl in g.players){

					var pl = g.players[pl];
					
					if(pl.id != self.id){ //get other players positions
						
						//calculate based on vision if I can see them, if yes append them to pkg with properties
				
						//check what terrain we're on?
				
						//if im a wolf show their username, else don't
				
						//if they are within vision, add to package for that player
						
						if(pl.x < self.x + self.v && pl.x > self.x - self.v && pl.y < self.y + self.v && pl.y > self.y - self.v){
							
							pkg.push({
								type: pl.type,
								username: pl.username, //show if wolf only probably
								public_id: pl.public_id, 
								x: pl.x,
								y: pl.y,
								d: pl.d,
								m: pl.m,
								s: pl.s,
								//display any buffs / debuffs, or visual effects?
							});
							
						}
						
					}

				}
				
				//if entities exist on the map, display them

				//ENTITIES
				for(var ent in g.entities){
					
					var ent = g.entities[ent];
					//if in vision, add to pkg
					if(ent.x < self.x + self.v && ent.x > self.x - self.v && ent.y < self.y + self.v && ent.y > self.y - self.v){
						
						pkg.push({
							type: ent.type,
							name: ent.name,
							public_id: ent.public_id,
							x: ent.x,
							y: ent.y,
						});
					
					}						
				}
				
				
				
				if(socket){ //because if no sockets are open could crash script..
					socket.emit("positions",pkg);
				}
				
			}

		}
	
	}

	
	//var t = Date.now();
	//console.log("Game Loop " + (t - gameLoopTime));
	
},1000/12);






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
	
	db.users.find({username_lc: username},{username: 1, soft: 1, hard: 1},{limit: 1},function(err,docs){

		if(docs.length > 0){
			
			//get case sensitive username and render page with necessary info
			docs.forEach(function(u){
				username = u.username;
				soft = u.soft;
				hard = u.hard;
			});
			
			res.render("ui",{
				username: username,
				hard: hard,
				soft: soft,
				
			});	
					
		}else{
			res.redirect("/");		
		}
	});
	
});

//the queue will have already inserted these things before this is loaded

/*
app.get("/game/:gameID",function(req,res){
	
	//check session
	var username = req.session.username;
	
	db.gamestate.find({username_lc: username},{limit: 1},function(err,docs){

		if(docs.length > 0){

			//find which game you belong to and render page
			docs.forEach(function(u){
				res.render("game",{
					g_id = u.g_id,
					rand_id = u.rand_id,
					username = u.username,	//case sensitive
					team = u.team,
					role = u.role,
					x = u.x,
					y = u.y,
					d = u.d,
					m = u.m,
					alive = u.alive,
					vis = u.vis,
					moveSpeed = u.moveSpeed,
					//debuffs?
					//buffs?
					width = u.width,
					height = u.height, //for testing unit collission?
				});					
			});
					
		}else{
			res.redirect("/");		
		}
	});
});
*/

app.get("/game/:gameID/:randID",function(req,res){
	
	//check session
	
	//when loading this page make sure that the player is logged in
	//check db to see which game they are in, make sure they're in the right one.
	//if they are trying to spectate the game, then update their status to spectating + game_id..
	//you can only be playing or spectating 1 game at a time.
	var ip = req.connection.remoteAddress;
	console.log("IP from express " + ip);
	var username = req.session.username;
	
	db.users.find({username_lc: username},{username: 1, soft: 1, hard: 1},{limit: 1},function(err,docs){
	
		if(docs.length > 0){
			
			var game_id = req.params.gameID;
			var rand_id = req.params.randID;
			
			res.render("game",{
				
				username: username,
				rand_id: rand_id,
				game_id: game_id
				
			});
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
	
	db.users.find({username_lc: username_lc},{limit: 1},function(err,docs){
		if(docs.length == 0){
			
			db.users.find({email_lc: email_lc},function(err,docs){
				if(docs.length == 0){
					
					if(password == password2){
						
						if(password.length > 6 && password.length < 20){
							
							if(email.indexOf("@") > -1 && email.indexOf(".") > -1){
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
									soft: 0,
									hard: 0,
									status: "Offline",
									karma: 25,
									friends: [],
									groups: []
									
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






app.get("*",function(req, res){
	res.send("bad route");
});

/*


var Player = function(id){
	
	var self = {
		
		g_id:,
		id:,
		x:,
		y:,
		
		number: "" + Math.floor(10 * Math.random()),
		pressingRight: false,
		pressingLeft: false,
		pressingUp: false,
		pressingDown: false,
		moveSpeed: 20,
		
		
		
	}
	
	
	
	
	
	
}






var loopT;
var loop = setInterval(function(){
	
 loopT = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
 loopT = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
 loopT = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
 loopT = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
 loopT = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
 loopT = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10); 
 loopT = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
 loopT = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
 loopT = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
	
},50);



var loop2 = setInterval(function(){
	console.log(loopT);
},1000);



*/






