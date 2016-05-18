var game_id = $("#game_id").html();
var username = $("#username").html();
var rand_id = $("#rand_id").html();

var gamestate = {};
var gamestate_2 = {};
var gamestate_3 = {};
var messages = [];
var keysDown = {};
	keysDown[65] = false;
	keysDown[68] = false;
	keysDown[83] = false;
	keysDown[87] = false;
	
var myDir = "0";

var server_fps = 0;
var client_fps = 0;

var frames_received = 0;

var frames_seq = 1;

var wW;
var wH;

//var globalVar = 0;

//var audio = new Audio("../../public/audio/howl.mp3");
//audio.play();


var ctx = document.getElementById("gamebg").getContext("2d");
ctx.font = "30px Arial";

ctx.canvas.width = wW = window.innerWidth;
ctx.canvas.height = wH = window.innerHeight;


//make the random ID for spectators all the same, always send to all spectators...
var socket = io({query: "rand_id=" + rand_id});
//give all spectators the same messages....




socket.on("gamestate",function(data){
	$("#chat_messages").html(data.timer + "<br>" + data.day + "<br>" + data.phase);
});

var perSecond = setInterval(function(){
	
	//compare what I have against the server
	$("#gameLog").html("server_fps: " + server_fps + "<br>" + "client_fps: " + client_fps + "<br>" + wW + "<br>" + wH + "<br>");
	server_fps = 0;
	client_fps = 0;
	
},1000);



socket.on("positions",function(data){  //Should be getting the package 8 times per second... if no lag
	
	
	
	frames_received++;
	
	//draw first frame exactly, then start interpolating the frames
	if(frames_received == 1){
		
		//draw frame exactly
		gamestate = data;
		drawFrame(data);
		
	}else{
		
		
		
		//draw interp 1, 
		drawFrame(gamestate);
		

		//gamestate_2
		//delete objects that no longer exist (out of vision, or dead maybe)
		for(var i = 0; i < gamestate.length; i++){
			
			var g = gamestate[i];
			//only check things that can change... dont check trees / non-moving level objects...
			
			var found = 0;
			//check new data for them, if it doesnt exist, delete them from gamestate
			for(var i2 = 0; i2 < data.length; i2++){
				
				var d = data[i2];
				
				//console.log("data received - " + d.x + " " + d.y);
				
				if(g.public_id == d.public_id){
	
					//update them right here...
					g.xEase = parseInt((d.x - g.x) / 3);  //divide the move up into 3 mini-moves
					g.x = g.x + g.xEase;
					
					//console.log("1 " + g.x + " " + g.xEase + " " + d.x);
					
					g.yEase = parseInt((d.y - g.y) / 3);
					g.y = g.y + g.yEase;
				
					found = 1;		
				}	
			}
			
			if(found == 0)
				delete g;		
			
		}
		
		
		gamestate_2 = gamestate;
		
		
		
		
		setTimeout(function(){
			drawFrame(gamestate_2);
		},40);
		
		
		/*
		
		console.log("g2len " + gamestate_2.length);
		
		for(var i = 0; i < gamestate_2.length; i++){
			if(gamestate_2[i].xEase || gamestate_2[i].yEase)
				console.log("EASE " + gamestate_2[i].xEase);
		}
		
		*/

		//draw frame 2..
		
		/*	
		setTimeout(function(){
			
			drawFrame();
			
			//gamestate_3...
			for(var i = 0; i < gamestate.length; i++){
				
				var g = gamestate[i];
				
				//globalVar = globalVar + 1;
				
				//console.log("2 " + g.x + " " + d.x + " " + g.xEase + " " + globalVar);
				
				
				//only check things that can change... dont check trees / non-moving level objects...
				if(g.xEase != 0 || g.yEase != 0){
					g.x = g.x + g.xEase;
					g.y = g.y + g.yEase;
					//console.log("2 " + g.x + " " + g.xEase);
				}
				

				
			}			
		},20); 
		
		//draw frame 3..
		setTimeout(function(){
			
			drawFrame();
			
			//gamestate_3...
			for(var i = 0; i < gamestate.length; i++){
				
				var g = gamestate[i];
				
				//console.log("3 " + g.x + " " + d.x + " " + g.xEase);
				
				//only check things that can change... dont check trees / non-moving level objects...
				if(g.xEase != 0 || g.yEase != 0){
					g.x = g.x + g.xEase;
					g.y = g.y + g.yEase;			
				}
			}			
		},40); 		
		
		//draw frame 4...
		setTimeout(function(){
			drawFrame();

		},60);
		
		
		*/
		gamestate = data; //show truth again, 1 frame behind

		
	}
	
	server_fps++;

});


//SEND MOVING = 1 or 0
//SEND reqX = 1/-1/0;
//SEND reqY = 1/-1/0;
//SEND Direction = 1,2,3,4;



function drawFrame(gamestate){
	
	client_fps++;

	//draw gamestate object {}
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
	
	var myT;
	var myX;
	var myY;
	var myV;

	var bgX;
	var bgY;
	var cLeft; 
	var cTop;
	
	var levelW = 3600;
	var levelH = 3600;
	
	for(var i = 0; i < gamestate.length; i++){
		
		var g = gamestate[i];

		//set background position / character position based on x y
		if(i === 0){ //me first in list always

			var myT = g.type;
			var myX = g.x;
			var myY = g.y;
			var myV = g.v;

			var modelH = 120;  //default size of all characters.. 
			var modelW = 120;
			
			
			//if too far left move character, not background
			//60 because 120x120 character, 
			
			/////////////////////// X UPDATE ////////////////////////////////
			var wWC_min = (wW/2) - (modelW/2);  //the X point where I need to move character instead of background
			var wWC_max = ((wW/2) - (modelW/2)) + (levelW - wW); //same for moving right.
			
			if(myX <= wWC_min){ //if too far left, move character
				bgX = 0;
				cLeft = myX;
			}else if(myX >= wWC_max){ //if too far right, move character
				if(wW >= levelW){wW = levelW}
				bgX = (levelW-wW) / 4; //because image 4x scale
				cLeft = myX - bgX * 4;	//unscale for cLeft			
			}else if(myX > wWC_min && myX < wWC_max){ //else move background
				bgX = (myX - ((wW/2)-(modelW/2))) / 4; //because image 4x scale
				cLeft = (wW/2) - (modelW/2);
			}
			
			/////////////////////// Y UPDATE ////////////////////////////////
			var wHC_min = (wH/2) - (modelH/2);
			var wHC_max = ((wH/2) - (modelH/2)) + (levelH - wH);
			
			if(myY <= wHC_min){
				bgY = 0;
				cTop = myY;
			}else if(myY >= wHC_max){
				if(wH >= levelH){wH=levelH}
				bgY = (levelH-wH) / 4;
				cTop = myY - bgY * 4;
			}else if(myY > wHC_min && myY < wHC_max){
				bgY = (myY - ((wH/2)-(modelH/2))) / 4;
				cTop = (wH/2) - (modelH/2);
			}			

			//draw background
			
			//calculate window scale
			var xRatio = Math.round((wW/levelW) * 100) / 100 * 4; // window width / image size, scale up 4x
			var yRatio = Math.round((wH/levelH) * 100) / 100 * 4; // window width / image size, scale up 4x
			
			//console.log(xRatio + " " + yRatio);
			
			ctx.drawImage(farmImg,bgX,bgY,wW,wH,0,0,levelW*xRatio,levelH*yRatio);

			//draw self
			if(myT == "W") 	ctx.drawImage(wolfImg,cLeft,cTop);			
			else if(myT == "S") ctx.drawImage(sheepImg,cLeft,cTop);
			

		//get all other entities	
		}else{
			
			var entT = g.type;
			var entX = g.x;
			var entY = g.y;
			//var h = gamestate[i].h; //height
			//var w = gamestate[i].w; //width
			
			eLeft = cLeft - (myX - entX);	//draw relative to me			
			eTop = cTop - (myY - entY);	//draw relative to me

			if(entT == "W") 	ctx.drawImage(wolfImg,eLeft,eTop);			
			else if(entT == "S") ctx.drawImage(sheepImg,eLeft,eTop);
			
		}

	}
	
	//4 square fog

	//offset for model height
	var vMod = myV - (modelH/2);
	
	var topFogH = cTop - vMod;

	var leftFogW = cLeft - vMod;
	var leftFogH = modelH + vMod*2;//character height + vision * 2
	
	var rightFogL = cLeft + modelW + vMod;//where fog starts
	var rightFogW = wW - rightFogL;
	var rightFogH = leftFogH; //both always same height;
	
	var botFogT = topFogH + leftFogH;
	var botFogH = wH - botFogT;
	
	ctx.fillStyle = 'rgba(0,0,0,0.5)';   //0.5
	//ctx.fillRect(0,0,wW,wH);	
	
	//top 
	ctx.fillRect(0,0,wW,topFogH);
	
	//left
	ctx.fillRect(0,topFogH-2,leftFogW,leftFogH+4);  //pixel offsets... dunno why
	
	//right
	ctx.fillRect(rightFogL,topFogH-2,rightFogW,rightFogH+4);
	
	//bottom
	ctx.fillRect(0,botFogT,wW,botFogH);


	console.log("bgX " + bgX + " bgY " + bgY + " cLeft " + cLeft + " cTop " + cTop);
	
	
	
}




function sendMove(h){
	
	setTimeout(function(){	socket.emit("changeDir",{game_id: game_id, rand_id: rand_id, h: h}); 	},140);
}



//68 == RIGHT == KEY D
//83 == DOWN == KEY S
//87 == UP      == KEY W
//65 == LEFT    == KEY A

//SEND DESIRED X / Y MOVEMENT.. VALIDATE ON CLIENT / THEN ON SERVER..
//SEND reqX = 1, reqY = 1, 



document.onkeydown = function(e){
	
	//if key within ASWD 
	//if nighttime and not focusing chat window
	if(e.keyCode === 68 || e.keyCode === 83 || e.keyCode === 87 || e.keyCode === 65){

		//put the key in the array...
		keysDown[e.keyCode] = true;
	
		if(keysDown[68] === true && keysDown[83] === true){
			if(myDir != "se"){
				sendMove("se");
				myDir = "se";					
			}
			
		}
		
		else if(keysDown[65] === true && keysDown[83] === true){
			if(myDir != "sw"){
				sendMove("sw");
				myDir = "sw";					
			}		
		}

		else if(keysDown[87] === true && keysDown[65] === true){
			if(myDir != "nw"){
				sendMove("nw");
				myDir = "nw";		
			}		
		}

		else if(keysDown[68] === true && keysDown[87] === true){
			if(myDir != "ne"){
				sendMove("ne");
				myDir = "ne";
			}		
		}

		else if(keysDown[68] === true){
			if(myDir != "e"){
				sendMove("e");
				myDir = "e";		
			}	
		}

		else if(keysDown[83] === true){
			if(myDir != "s"){
				sendMove("s");
				myDir = "s";		
			}	
		}

		else if(keysDown[65] === true){
			if(myDir != "w"){
				sendMove("w");
				myDir = "w";	
			}	
		}

		else if(keysDown[87] === true){
			if(myDir != "n"){
				sendMove("n");
				myDir = "n";	
			}	
		}
	}
}
/*

*/

document.onkeyup = function(e){

	//if key within ASWD 
	//if nighttime and not focusing chat window
	if(e.keyCode === 68 || e.keyCode === 83 || e.keyCode === 87 || e.keyCode === 65){

		//put the key in the array...
		keysDown[e.keyCode] = false;
		if(keysDown[68] === false && keysDown[83] === false && keysDown[65] === false && keysDown[87] === false){
			if(myDir != "0"){
				sendMove("0");
				myDir = "0";					
			}
		}	
		else if(keysDown[68] === true && keysDown[83] === true){
			if(myDir != "se"){
				sendMove("se");
				myDir = "se";					
			}
		}
		
		else if(keysDown[65] === true && keysDown[83] === true){
			if(myDir != "sw"){
				sendMove("sw");
				myDir = "sw";					
			}		
		}

		else if(keysDown[87] === true && keysDown[65] === true){
			if(myDir != "nw"){
				sendMove("nw");
				myDir = "nw";		
			}		
		}

		else if(keysDown[68] === true && keysDown[87] === true){
			if(myDir != "ne"){
				sendMove("ne");
				myDir = "ne";
			}		
		}

		else if(keysDown[68] === true){
			if(myDir != "e"){
				sendMove("e");
				myDir = "e";		
			}	
		}

		else if(keysDown[83] === true){
			if(myDir != "s"){
				sendMove("s");
				myDir = "s";		
			}	
		}

		else if(keysDown[65] === true){
			if(myDir != "w"){
				sendMove("w");
				myDir = "w";	
			}	
		}

		else if(keysDown[87] === true){
			if(myDir != "n"){
				sendMove("n");
				myDir = "n";	
			}	
		}
	}
}

$(window).resize(function(){
	ctx.canvas.width = wW = window.innerWidth;
	ctx.canvas.height = wH = window.innerHeight;	
});

	
/*

socket.on("message",function(data){
	console.log("message " + data)
});
	

	
var updatePosition = setInterval(function(){
	
	
	
	//if pressing nothing, do nothing
	//if any keys are pressed, then run the update.
	socket.emit("updateposition",{
	
		gamd_id: 
		username: 
		rand_id: 
		
	
	});
	
	
},1000);

*/