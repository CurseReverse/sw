//version:






$("#gameOptions").append(" " + username);

var day = 0;
var phase = "";
var timer = 0;
var eliminator = 0;
var hypnotized = 0;
var _protected = 0;
var hypSel = 0;

var messageCounter = 0;
var newWolfMessages = 0;

var selections = [];

var myRole;
var mySeat;
var myTeam;
var myAlive = 0;
var myCharges = 0;


var color = {};

color[0] = "gray";
color[1] = "#ff1a1a";
color[2] = "#007a99";
color[3] = "green";
color[4] = "purple";
color[5] = "orange";
color[6] = "pink";
color[7] = "aqua";
color[8] = "brown";
color[9] = "#cccc00";
//etc....

var roleDesc = {};

roleDesc["Sheep"] = {team: "Sheep", desc: "Bahhh"};
roleDesc["Wolf"] = {team: "Wolf", desc: "May alter evidence."};
roleDesc["Protector"] = {team: "Sheep", desc: "Picks a player during the evening (excluding self), the player is protected from wolves that night. If successful, loses this ability."};
roleDesc["Trapper"] = {team: "Sheep", desc: "Booby traps any player during the evening (excluding self). If the player is attacked by wolves, both the player and a random wolf will die. If successful, loses this ability."};
roleDesc["Traitor"] = {team: "Sheep", desc: "Wins if wolves win, appears as Sheep in every way.  Knows who the wolves are.  Wolves don't know who the Traitor is. May alter evidence"};
roleDesc["Seer"] = {team: "Sheep", desc: "Picks a player during the evening, learns the true role of that player"};
roleDesc["Recruiter"] = {team: "Wolf", desc: "Instead of eating a player, may convert one non-wolf into a Traitor.  May only use once."};
roleDesc["Hypnotist"] = {team: "Wolf", desc: "May pick a player in the evening.  The Hypnotist controls the player's chat and picks during the next Day.  May only use once."};
roleDesc["Coroner"] = {team: "Sheep", desc: "Knows the true role of all dead players."};


currSelections = {};
currSelections[1] = 0;
currSelections[2] = 0;
currSelections[3] = 0;
currSelections[4] = 0;
currSelections[5] = 0;
currSelections[6] = 0;
currSelections[7] = 0;
currSelections[8] = 0;
currSelections[9] = 0;

//var audio = new Audio("../../../public/audio/howl.mp3");
//audio.volume = 0.5; //half volume
//audio.play();

//make the random ID for spectators all the same, always send to all spectators...
var socket = io({query: "rand_id=" + rand_id + "&game_id=" + game_id + "&seat=" + mySeat});
//give all spectators the same messages....


//RECEIVED FROM SERVER

socket.on("gamestate",function(data){
	
	var tr = [];
	//when we connect to the socket, receive gamestate as it is
	for(var i = 0; i < data.length; i++){
		
		var d = data[i];
		
		//console.log("DTYPE " + d.type);
		
		if(d.type == "g"){
			
			day = d.day;
			phase = d.phase;			
			timer = d.timer;
			eliminator = d.eliminator;
			
			//Give cannon if neccessary...
			if(d.phase == "Eliminate") $("#player" + d.eliminator + "Box").find(".cannon").css("background-image","url('../../../public/images/cannon.png')");	

			
			if(d.phase == "Day" || d.phase == "Suspect" || d.phase == "Trust" || d.phase == "Eliminate"){
				
				$(".bg").hide();
				$("#bgDay").show();
				$("#background_s").css("background-color","#004d39");
				$("#background_nw").css("background-color","blue");
				
			}else if(d.phase == "Evening"){
				
				$(".bg").hide();
				$("#bgEvening").show();
				$("#background_s").css("background-color","#061310");
				$("#background_nw").css("background-color","black");		
				
			}else if(d.phase == "Night"){
				
				$(".bg").hide();
				$("#bgNight").show();
				$("#background_s").css("background-color","#061310");
				$("#background_nw").css("background-color","black");
			}
			
			
			//var pha = document.getElementById("phase" + d.phase);
			//$(".phase").css({"font-weight":"normal","color":"gray","font-size":"100%"});
			//$(pha).css({"font-weight":"bold","color":"#d9d9d9","font-size":"110%"});
			//$("#phase").html(d.phase + " " + d.day);
			
			$("#score").html("Sheep: " + d.sheep + "<br>" + "Wolves: " + d.wolves);
			
			if(d.evd.length > 0){ //if the evidence has been submitted show it to everyone
				
				//<div class="evd">1</div><div class="evd">2</div><div class="evd">3</div><div class="evd">4</div>
				console.log("Evidence submitted");
				
			}
			

		}else if(d.type == "p"){ //else its a player

			
			if(d.username == username){ //if me, handle all relevant info

				myAlive = d.alive;
				myRole = d.role;
				mySeat = d.seat;
				myTeam = d.team;
				
				$("#player" + mySeat + "Box").find(".playerLight").remove(); //remove my hover player light
				$("#player" + d.seat + "Info").css({"webkit-box-shadow":"0px 0px 2px 1px #009973","-moz-box-shadow":"0px 0px 2px 1px #009973","box-shadow":"0px 0px 2px 1px #009973"});
				//put green shadow around MY info
				
				if(d.alive == 1){
					
					if(d.team == "w")  createWolfChat();//if im a living wolf, create wolf chat

				}else{
					
					initSpectatorChat(); //if dead, give me spectator chat
					
				}
			
				if(d.evd != ""){
					
					//show popup 
					//if im wolf or traitor, allow me to edit the players
					//show to me at random time in the day...
					console.log("evidence found" + d.evd.type + " " + d.evd.target + " " + d.evd.altered);
					

					
					
				}	
				
				if(d.charges) myCharges = d.charges; //set my role charges (example. protector can only suceed once, hypnotist can only use it once)

				if(d.hypnotized == d.seat){ //if im currently hypnotized, disable chat and notify...
					
					hypnotized = d.hypnotized;
					$("#player" + d.seat + "InfoColor").html("Hypnotized");
					$("#sendMessage").prop({"disabled":true,"placeholder":"Hypnotized..."});
					
				} 
					
			}
			
			//identify div based on seat, put their properties in that seat
			var pDiv = document.getElementById("player" + d.seat); //Div to represent the IMAGE of player, used later
			$("#player" + d.seat + "InfoUsername").html(d.username); //populate username
			

			$("#player" + d.seat + "InfoSuspected").html(d.suspected); //populate suspected votes
			$("#player" + d.seat + "InfoTrusted").html(d.trusted);			//populate trusted votes
			
			if(d.alive == 0){ //if dead, how did they die
			
				//give dead properties
				var pBox = document.getElementById("player" + d.seat + "Box");
				$(pBox).find(".playerLight").remove();
				$(pBox).find(".playerLight2").remove();
				$(pBox).find(".playerInfoUsername").css("color","gray");
				$(pBox).find(".playerInfoColor").css({"background-color":"black","color":"gray"});
				$(pBox).find(".playerInfoButton").css({"background-color":"black","color":"gray"});
				$(pBox).addClass("deadPlayer").removeClass("player");	
				
				if(d.eaten == 1){
					
					$(pDiv).css({"background-image":"url('../../../public/images/eaten.png')"});

					
				}else{ //was exploded somehow...
					
					$(pDiv).css({"background-image":"url('../../../public/images/eliminated.png')"});
					var t;
					if(d.team == "s") t = "Sheep";
					else if(d.team == "w") t = "Wolf";
					$("#player" + d.seat + "InfoColor").html(t); //show TEAM of dead player
					
				}
				
				if(myRole == "Coroner") $("#player" + d.seat + "InfoColor").html(d.role); //if Coroner, show true role of the dead player
					

			}else{ //if alive, what are they, and what props.
				
				if(d.team == "s"){
					
					$(pDiv).css({"background-image":"url('../../../public/images/sheep.png')"});
					$("#sleeping" + d.seat).css({"background-image":"url('../../../public/images/sleepingsheep.png')"});

				}else if(d.team == "w"){
					
					$(pDiv).css({"background-image":"url('../../../public/images/wolf.png')"});
					$("#sleeping" + d.seat).css({"background-image":"url('../../../public/images/sleepingwolf.png')"});
					
				} 
				
				var props = "";
				
				if(d.feet != ""){
					
					
				}				
				
				if(d.body != ""){
					
					
				}				
				
				if(d.face != ""){
					
					
				}				
				
				if(d.eyes != ""){
					
					
				}				
				
				if(d.head != ""){
						
					//props += "<div class='prop' id='"
						
				}

			}

		
			if(d.seen == 1) $("#player" + d.seat + "InfoColor").html(d.role); //if seer and saw the player, overwrite with true role

		
		}else if(d.type == "tr"){ //True roles in the game, used later for role descriptions in top left of game

			tr.push({
				team: d.team,
				role: d.role
			});
			
		}else if(d.type == "s"){ //type = "s" for end of game summary, game not in progress, render this once then do nothing
			
			$("#gameArea").html("winner " + d.winner + " players " + d.players);
			
		}

	}
	
	
	
	if(rand_id == "spectate"){
		
		initSpectatorChat();
		
	}
	
	//Generate Game Comp, tag myself with <-- (me)
	
	var me = 0;
	var gcs = "";
	var gcw = "";
	
	
	for(var i = 0; i < tr.length; i++){

		var d = tr[i];
		
		if(d.team == "s"){
			
			if(me == 0 && myRole == d.role){  //using "me" because only want to tag once.. in case im wolf and there are 2 wolfs..
				gcs += " - <span class='gameCompRole'>" + d.role + "</span><span style='color: #009973;'> &larr; (me)</span><br>";
				me = 1;
			}else{
				gcs += " - <span class='gameCompRole'>" + d.role + "</span><br>";
			}
			
			
		}else if(d.team == "w"){
			
			if(me == 0 && myRole == d.role){
				gcw += " - <span class='gameCompRole'>" + d.role + "</span><span style='color: #009973;'> &larr; (me)</span><br>";
				me = 1;
			}else{
				gcw += " - <span class='gameCompRole'>" + d.role + "</span><br>";
			}
			
		}	
		
	}
	
	$("#gameCompSheep").html("<u><span id='teamSheep' style='font-size: 110%;'>Team Sheep (7)</span></u><br>" + gcs);
	$("#gameCompWolves").html("<u><span id='teamWolf' style='font-size: 110%;'>Team Wolf (2)</span></u><br>" + gcw);

	
	//add hover events to Game Comp
	$("#teamSheep").hover(
		function(){
			$("#roleTitle").html("Team Sheep");
			$("#roleImage").css("background-image","url('../../../public/images/roleIconSheep.png')");
			$("#roleDesc").html("Wins when all wolves are eliminated");
			
			$("#roleInfo").show();
			
		},function(){ //light off when moving off that player
			$("#roleInfo").hide();
				
	});
	
	$("#teamWolf").hover(
		function(){
			$("#roleTitle").html("Team Wolf");
			$("#roleImage").css("background-image","url('../../../public/images/roleIconWolf.png')");
			$("#roleDesc").html("Wolves win if they are no longer outnumbered by Sheep");
			
			$("#roleInfo").show();
			
		},function(){ //light off when moving off that player
			$("#roleInfo").hide();
				
	});	
	
	$(".gameCompRole").hover(
		function(){
			var role = $(this).html();
			$(this).css("font-weight","bold");
			$("#roleTitle").html(role);
			$("#roleImage").css("background-image","url('../../../public/images/roleIcon" + role + ".png')");
			$("#roleDesc").html(roleDesc[role].desc);
			
			$("#roleInfo").show();
			
		},function(){ //light off when moving off that player
			$("#roleInfo").hide();
			$(this).css("font-weight","normal");	
	});
	
	tr = [];
	
	//add hover events for evidence...
	//$("#evdHover")
	//$(".evd").hover
	initiatePhase(phase);
	
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on("phaseChange",function(data){
	
	//when a phase is changing, using new info, update gameboard
	
	if(data.phase != "End"){ //unless the game is ending, update timer and stuff
		
		day = data.day;
		phase = data.phase;
		timer = data.timer;
		
		//var pha = document.getElementById("phase" + d.phase);
		//$(".phase").css({"font-weight":"normal","color":"gray","font-size":"100%"});
		//$(pha).css({"font-weight":"bold","color":"#d9d9d9","font-size":"110%"});
		//$("#phase").html(data.phase + " " + data.day);
		//$("#phaseTimer").html(data.timer - 1); //1 second lag..
		//$("#score").html("Sheep: " + data.sheep + "<br>" + "Wolves: " + data.wolves);
		
	}else{ //game is ending...
		
		//var pha = document.getElementById("phase" + d.phase);
		//$(".phase").css({"font-weight":"normal","color":"gray","font-size":"100%"});
		//$(pha).css({"font-weight":"bold","color":"#d9d9d9","font-size":"110%"});
		$("#phase").html(data.phase + " " + data.day);
		
	}
	
	if(data.phase == "Day"){
	
		if(data.day != 1){
			
			if(data.eaten == 0){ //nobody was eaten, either protected or recruited
				
				//if protector suceeded....
					//addMessage("-- <span style='color: gray; font-style: italic;'>The wolf target was Protected! --</span><br>","all");
				
				//if someone was recruited
					//
				
			}else{ //A player was eaten last night... 
				
				$("#player" + data.eaten).css("background-image","url('../../../public/images/eaten.png')"); //eat player
				
				if(data.eaten == mySeat) die("eaten"); //if I got eaten, kill me

				//kill the player
				var p = document.getElementById("player" + data.eaten);
				var pBox = document.getElementById("player" + data.eaten + "Box");
				$(p).siblings(".playerLight").remove();
				$(p).siblings(".playerLight2").remove();
				$(p).find(".playerStatus").remove();	
				$(pBox).find(".playerInfoUsername").css("color","gray");
				$(pBox).find(".playerInfoColor").css({"background":"black","color":"gray"});
				$(pBox).find(".playerInfoButton").css({"background":"black","color":"gray"});			
				$(p).addClass("deadPlayer").removeClass("player");				
				
				var elimU = $(p).siblings(".playerInfo").find(".playerInfoUsername").html();

				addMessage("-- <span style='color: " + color[data.eaten] + "; font-style: italic;'>" + elimU + "</span> <span style='font-style: italic; color: gray;'> was Eaten!</span><br>","all");
				
				if(myRole == "Coroner") $("#player" + data.eaten + "InfoColor").html(data.eatenRole); //Tell coroner role of eaten player
				
			}
			
			if(data.trapped != 0){  //trapper suceeded... eliminating the wolf
				
				$("#player" + data.trapped).css("background-image","url('../../../public/images/eliminated.png')");
				
				if(data.trapped == mySeat) die("trapped"); //if you got trapped, die
				
				//kill the player
				var p = document.getElementById("player" + data.trapped);
				var pBox = document.getElementById("player" + data.trapped + "Box");
				$(p).siblings(".playerLight").remove();
				$(p).siblings(".playerLight2").remove();
				$(p).find(".playerStatus").remove();	
				$(pBox).find(".playerInfoUsername").css("color","gray");
				$(pBox).find(".playerInfoColor").css({"background-color":"black","color":"gray"});
				$(pBox).find(".playerInfoButton").css({"background-color":"black","color":"gray"});			
				$(p).addClass("deadPlayer").removeClass("player");				
				
				var trapU = $(p).siblings(".playerInfo").find(".playerInfoUsername").html();
				
				addMessage("-- <span style='color: " + color[data.trapped] + "; font-style: italic;'>" + trapU + "</span> <span style='font-style: italic; color: gray;'> was Exploded!</span><br>","all");
				
				if(myRole == "Coroner") $("#player" + data.trapped + "InfoColor").html(data.trappedRole);
				else $("#player" + data.trapped + "InfoColor").html("Wolf");			
				
			}
			

			if(data.recruited){ //if someone is getting recruited.. Only wolves and the recruited will get this
				
				if(data.recruited == mySeat){ //if Im getting recruited
					
					myRole = "Traitor"; //turn me to a traitor!!
					for(var i = 0; i < data.wolves.length; i++){ //tell me who wolves are
						
						var w = data.wolves[i];
						$("#player" + w + "InfoColor").html("Wolf");
						$("#player" + w).css("background-image","url('../../../public/images/wolf.png')");

					}

				}
				
				$("#player" + data.recruited + "InfoColor").html("<span id='traitor_desc'>Traitor</span>");
				$("#traitor_desc").hover(
					function(){
						var role = $(this).html();
						$(this).css("font-weight","bold");
						$("#roleTitle").html(role);
						$("#roleImage").css("background-image","url('../../../public/images/roleIcon" + role + ".png')");
						$("#roleDesc").html(roleDesc[role].desc);
						
						$("#roleInfo").show();
						
					},function(){ //light off when moving off that player
						$("#roleInfo").hide();
						$(this).css("font-weight","normal");	
				});
				
			}
			
			if(hypnotized == mySeat){ //if im hypnotized	
			
				//unhypnotize me
				$("#sendMessage").prop({"placeholder":"message...","disabled":false});
				$("#player" + hypnotized + "InfoColor").html("");
				hypnotized = 0;
				
			}
			
			if(data.hypnotized){
				
				if(data.hypnotized == mySeat){ //if im getting hypnotized	
				
					$("#sendMessage").prop({"placeholder":"Hypnotized...","disabled":true});
					$("#player" + data.hypnotized + "InfoColor").html("Hypnotized");
					hypnotized = mySeat;	
				
				}
			
			}
			
		}
	
	
	}else if(data.phase == "Suspect"){
		
		//moving from Day phase.. dont need to do anything
		//IF DAY == 1, PROCESS EVIDENCE...
		
	}else if(data.phase == "Trust"){ 
	
		//console.log("PHASE CHANGE " + data.phase);
		
		//loop through new counts, update in game...
		for(var i = 0; i < data.newCounts.length; i++){
			
			var seat = data.newCounts[i].seat;
			var susCount = data.newCounts[i].suspected;
			var susDiv = document.getElementById("player" + seat + "InfoSuspected");
			$(susDiv).html(susCount);

		}
		
		for(var i = 0; i < data.selections.length; i++){
			
			var s = data.selections[i];
			addMessage("-- <span style='color: gray; font-style: italic;'><span style='color: " + color[s.voterSeat] + ";'>" + s.voter + "</span> suspected &rarr; <span style='color: " + color[s.voted_forSeat] + ";'>" + s.voted_for + "</span></span><br>","all");
			selections.push(s);
			
		}


	}else if(data.phase == "Eliminate"){
	
		//update trusted counts...
		for(var i = 0; i < data.newCounts.length; i++){
			
			var seat = data.newCounts[i].seat;
			var truCount = data.newCounts[i].trusted;
			var truDiv = document.getElementById("player" + seat + "InfoTrusted");
			$(truDiv).html(truCount);

		}
		
		for(var i = 0; i < data.selections.length; i++){
			
			var s = data.selections[i];
			addMessage("-- <span style='color: gray; font-style: italic;'><span style='color: " + color[s.voterSeat] + ";'>" + s.voter + "</span> trusted &rarr; <span style='color: " + color[s.voted_forSeat] + ";'>" + s.voted_for + "</span></span><br>","all");
			selections.push(s);
			
		}
		
		//Update cannon holder
		eliminator = data.eliminator;
		$("#player" + data.eliminator + "Box").find(".cannon").css("background-image","url('../../../public/images/cannon.png')");
	
	}else if(data.phase == "Evening"){ //starting evening
	
		if(myTeam == "w" && hypnotized != 0){
			
			$("#player" + hypnotized + "InfoColor").html("");
			hypnotized = 0;

			if(myRole == "Hypnotist"){ //remove control panel for hypnotist...

				$("#hypnoSend").hide();
				$("#hypnoVote").hide();
				
			}
			
		}
		
		//take cannon image away
		$("#player" + eliminator + "Box").find(".cannon").css("background-image","");
		eliminator = 0;
		//unset cannon variable

		
		//destroy eliminated player... change their picture to eliminated picture...
		$("#player" + data.eliminated).css("background-image","url('../../../public/images/eliminated.png')");
		
		if(data.eliminated == mySeat) die("exploded"); //If I was eliminated, kill me

		//kill player
		var p = document.getElementById("player" + data.eliminated);
		var pBox = document.getElementById("player" + data.eliminated + "Box");
		$(p).siblings(".playerLight").remove();
		$(p).siblings(".playerLight2").remove();
		$(p).find(".playerStatus").remove();	
		$(pBox).find(".playerInfoUsername").css("color","gray");
		$(pBox).find(".playerInfoColor").css({"background-color":"black","color":"gray"});
		$(pBox).find(".playerInfoButton").css({"background-color":"black","color":"gray"});
		$(p).addClass("deadPlayer").removeClass("player");	
		
		var elimU = $(p).siblings(".playerInfo").find(".playerInfoUsername").html();
		
		addMessage("-- <span style='color: " + color[data.eliminated] + "; font-style: italic;'>" + elimU + "</span> <span style='color: gray; font-style: italic;'>was Eliminated!</span><br>","all");
		
		if(myRole == "Coroner"){
			$("#player" + data.eliminated + "InfoColor").html(data.eliminatedRole); //coroner gets role of eliminated player
		}else{
			var t;
			
			if(data.eliminatedTeam == "s") t = "Sheep";
			else if(data.eliminatedTeam == "w") t = "Wolf";
			
			$("#player" + data.eliminated + "InfoColor").html(t); //everyone else gets team only
			
		}	
			
	}else if(data.phase == "Night"){
			
		if(myAlive == 1){

			if(myRole == "Seer"){ //show last seen player...
				
				var role = data.seenRole;
				var seenDiv = document.getElementById("player" + data.seenSeat);
				var pColorBox = document.getElementById("player" + data.seenSeat + "InfoColor");
				
				$(pColorBox).html(role); //add true role to color box
				
				if(role == "Sheep" || role == "Protector" || role == "Trapper" || role == "Traitor"){ //add every other sheep role here....
					
					$(seenDiv).css("background-image","url('../../../public/images/sheep.png')");
					
				}else if(data.seenRole == "Wolf" || data.seenRole == "Hypnotist" || data.seenRole == "Recruiter"){ //add every special wolf role here also...
					
					$(seenDiv).css("background-image","url('../../../public/images/wolf.png')");
					
				} 
				
				//console.log("SAW ROLE " + role);
				
			}else if(myRole == "Protector"){
				
				_protected = data._protected;
				var pColorBox = document.getElementById("player" + data._protected + "InfoColor");
				$(pColorBox).html("Protected");
				
			}else if(myRole == "Trapper"){

				var pColorBox = document.getElementById("player" + data.trapped + "InfoColor");
				$(pColorBox).html("Trapped");		
				
			}else if(myTeam == "w"){
				
				$("#player" + hypnotized + "InfoColor").html(""); //unset hypnotized player...

				if(data.hypnotized != 0){ //if new hypnotized player, set them..
					
					$("#player" + data.hypnotized + "InfoColor").html("Hypnotized");	
					hypnotized = data.hypnotized;
					
				}

			}

		}
		
	}else if(data.phase == "End"){
		
		//show the screen saying game over....
		$("#timer").html(60);
		$("#phase").html("Game Over");
				
		if(data.winner == "w"){
			$("#gameEndTitle").html("Wolves win!");
			$("#gameEndImage").css("background-image","../../../public/images/wolvesWin.png");
			
		}else if(data.winner == "s"){
			$("#gameEndTitle").html("Sheep win!");
			$("#gameEndImage").css("background-image","../../../public/images/sheepWin.png");
		}

		
		//add true roles to the roles section for everyone
		var geRoles = "";
		for(var i = 0; i < data.roles.length; i++){
			var r = data.roles[i];
			var w = "";
			if(r.win == 1) w = "<span style='color: green;'>W</span>";
			else if(r.win == 0) w = "<span style='color: red;'>L</span>";
			geRoles = geRoles + w + " - " + "<span style='color: " + color[r.seat] + " ;'>" + r.username + "</span> - " + r.role + "<br>";
		}
		
		$("#gameEndRoles").html(geRoles);
		
		
		//based on role, prepare to handle stats from server...
		if(rand_id == "spectate"){
			
			//spectators dont get stats... so shrink the end game window... clear non-relevent stuff
			$("#gameEndStats").html("Spectator...");
			
		}else{
			
			//set stats image
			$("#ges_img").css("background-image","url('../../../public/images/roleIcon" + myRole + ".png')");
			
			var v;
			
			if((data.winner == myTeam && myRole != "Traitor") || (data.winner == "w" && myRole == "Traitor"))
				v = "Victory";
			else
				v = "Defeat";
			
			if(data.rankCat == 0){ //unranked
				
				var gamesLeft = 10 - data.gamesPlayed;
				
				$("#ges_header").html(username + "<br>" + gamesLeft + " until ranked!");
				
			}else if(data.rankCat == -1){ //placement game
				
				$("#ges_header").html(username + "<br>10th game! New rank: " + data.rankCat);
				
			}else{ //rank applies
				
				if(data.pointsChange > 0)
					$("#ges_header").html(username + "<br>" + data.rankCat + ": (" + data.rankPoints + ")(<span style='color: green;'>" + data.pointsChange + "</span>)");
				else
					$("#ges_header").html(username + "<br>" + data.rankCat + ": (" + data.rankPoints + ")(<span style='color: red;'>" + data.pointsChange + "</span>)");
			
			}

			var awards = "Played: 50 G<br>";
			if(v == "Victory") awards += "Win: 100 G<br>";
			if(data.winStreak > 0) awards += "Win Streak Bonus: " + (data.winStreak * 10) + " G<br>";
			
			if(myTeam == "s"){ //break up statement
				
				if(myRole != "Traitor"){
					
					//handle standard sheep stats package...
					if(data.stat_elim_correct > 0) awards += "Eliminated a Wolf x " + data.stat_elim_correct + ": " + (data.stat_elim_correct * 25) + " G<br>";
					if(data.stat_sus_correct > 0) awards += "Suspected a Wolf x " + data.stat_sus_correct + ": " + (data.stat_sus_correct * 2) + " G<br>";
					
					$("#ges_content").html(awards + "---------------<br>Suspected " + data.suspected + " times<br>Trusted " + data.trusted + " times<br>Suspects chosen: " + data.stat_sus_chosen + "<br>Wolves suspected: " + data.stat_sus_correct + "<br>Trusted " + data.stat_tru_chosen + " players<br>Trusted " + data.stat_tru_correct + " sheep<br>Players Eliminated: " + data.stat_elim_chosen + "<br>Wolves Eliminated: " + data.stat_elim_correct);

				}else if(myRole == "Traitor"){
					
					if(data.trusted > 0) awards += "Trusted x " + data.trusted + ": " + data.trusted + " G<br>";
					awards += "Accepted bribe from Wolves: 20 G<br>";
					//handle traitor package
					$("#ges_content").html(awards + "---------------<br>Suspected " + data.suspected + " times<br>Trusted " + data.trusted + " times");
				}//ETC...
				
			}else if(myTeam == "w"){ //break up statement
				
				if(data.stat_spec_eats > 0) awards += "Special Sheep eaten x " + data.stat_spec_eats + ": " + (data.stat_spec_eats * 10) + " G<br>";
				if(data.trusted > 0) awards += "Trusted x " + data.trusted + ": " + data.trusted + " G<br>";
				
				$("#ges_content").html(awards + "------------------<br>Suspected " + data.suspected + " times<br>Trusted " + data.trusted + " times<br>Sheep eaten: " + data.stat_eats + "<br>Special sheep eaten: " + data.stat_spec_eats);
				
			}
				
		}

		$("#gameEnd").show();
		
	}
	
	initiatePhase(data.phase);
	
});



function initiatePhase(phase){
	
	playerSelectorOff();
	
	$(".playerCount").html("");
	
	$("#phaseDesc").html("");
	$("#phaseTimer").html(timer);
	$("#selection").html("");
	
	
	if(phase == "Pregame"){
		
		//do nothing...
		
	}else if(phase == "Day"){
		
		$("#phaseDesc").html("Day... ");

		if($("#wolfChat").is(":visible") == true) $("#toggleChat").click();
		
		if(myAlive == 1)
			if(hypnotized != mySeat) $("#sendMessage").prop({"disabled":false,"placeholder":"message..."}); //restore chat if not hypnotized

		
		
		//adjust setting...
		$(".bg").fadeOut();
		$("#bgDay").fadeIn();
		$("#background_s").css("background-color","#004d39");
		$("#background_nw").css("background-color","blue");
				
		//make sure everyone is awake... because its daytime...
		$(".player").each(function(){
			
			var d = $(this).attr("id");
			var seat = parseInt(d.substr(6,1));	
			var img = $(this).css("background-image");
			if(img.indexOf("sleeping") > -1){ //if sleeping, awaken them
				var newImg = img.replace("sleepingsheep","sheep").replace("sleepingwolf","wolf"); //show awake version of what they are
				$(this).css("background-image",newImg);
			}
				
		});	

		$(".playerBox").show();
		$(".deadPlayerBox").show();		
	
		addMessage("<span style='color: gray; font-style: italic;'>-- Day " + day + " --</span><br>","all");
		
		if(myRole == "Protector") $("#player" + _protected + "InfoColor").html("");
		
		if(myRole == "Hypnotist" && hypnotized != 0){ //GIVE ME HYPNO CONTROL PANEL....
		
			var living = "<option selected='Pick player' value='0'>Pick player</option>";
			$(".player").each(function(){
				
				var rs = $(this).attr("id"); //ex player 1
				var s = rs.substr(6,1); //now just 1
				if(s != hypnotized){ //don't show self...
					var u = $(this).siblings(".playerInfo").find(".playerInfoUsername").html();
					living += "<option value='" + s + "'>" + u + "</option>";
				}
				
			});
			
			$("#hypSelection").html(living); //put all living players in a drop down list so hypnotist can vote

			var u = $("#player" + hypnotized + "InfoUsername").html();
			$(".hyp_u").html(u);
			$("#hypnoSend").show();
			$("#hypnoVote").show();
			
			$("#hypnoSend").click(function(){
				
				if(messageCounter >= 8){ //if spam, 10 (change here <--) messages per 10 seconds
		
					$("#sendMessage").val("");
					//tell them they're spamming??
				}else{
					
					var message = $("#sendMessage").val();
					
					if(message.length > 0 && message.length < 160){
						
						$("#sendMessage").val("");
						
						//addMessage("<span style='color: " + color[mySeat] + ";'>" + username + "</span>: " + message + "<br>","all");
						
						//$("#chatMessages").mCustomScrollbar("scrollTo","last");
						
						console.log("hypnotized " + hypnotized);
						
						socket.emit("chatMessage",{
							
							game_id: game_id,
							seat: hypnotized,
							type: "all",
							rand_id: rand_id,
							message: message,
							
						});
						
						messageCounter++;
						
					}		
					
				}	
				
			});
			
			$("#hypSelection").change(function(){
				
				//take new value from dropdown, send to server...
				var selection = $(this).val();
				
				console.log("hypsel" + selection);

				socket.emit("selectPlayer",{
				
					game_id: game_id,
					seat: hypnotized,
					rand_id: rand_id,
					selection: selection,
					phase: phase,
				
				});	
				
				
			});
			
			
			myCharges = 0; //ability was used, cant use again...
			
		} 

		
	}else if(phase == "Suspect"){ //Start of suspect phase
		
		addMessage("<span style='color: gray; font-style: italic;'>-- Suspect " + day + " --</span><br>","all");
		
		if(myAlive == 1){
			//update phase guide
			$("#phaseDesc").html("Who is suspicious?... ");
			$("#selection").html("(click player)");
			
			//change player light to RED for suspecting...
			$(".playerLight").css({"-webkit-box-shadow":"2px 7px 50px 30px rgba(252,8,8,1)","-moz-box-shadow":"2px 7px 50px 30px rgba(252,8,8,1)","box-shadow":"2px 7px 50px 30px rgba(252,8,8,1)","top":"55","height":"110","width":"30","left":"50","background-color":"rgba(252,8,8,1)"});
			$(".playerLight2").css({"-webkit-box-shadow":"2px 7px 50px 30px rgba(252,8,8,1)","-moz-box-shadow":"2px 7px 50px 30px rgba(252,8,8,1)","box-shadow":"2px 7px 50px 30px rgba(252,8,8,1)","top":"55","height":"110","width":"30","left":"50","background-color":"rgba(252,8,8,1)"});
			
			$(".playerCount").css({"text-shadow":"-2px 0 red, 0 1px red, 1px 0 red, 0 -1px red"});
			//display the light when hovering a player
			playerSelectorOn(phase,myRole);
			
		}
		
	}else if(phase == "Trust"){ //start of trusted phase

		addMessage("<span style='color: gray; font-style: italic;'>-- Trust " + day + " --</span><br>","all");
	
		if(myAlive == 1){

			//update phase guide
			$("#phaseDesc").html("Who can be trusted?... ");
			$("#selection").html("(click player)");
			
			//change player light to GREEN for trusting...
			$(".playerLight").css({"-webkit-box-shadow":"2px 7px 50px 30px rgba(10,250,18,1)","-moz-box-shadow":"2px 7px 50px 30px rgba(10,250,18,1)","box-shadow":"2px 7px 50px 30px rgba(10,250,18,1)","top":"55","height":"110","width":"30","left":"50","background-color":"rgba(10,250,18,1)"});	
			$(".playerLight2").css({"-webkit-box-shadow":"2px 7px 50px 30px rgba(10,250,18,1)","-moz-box-shadow":"2px 7px 50px 30px rgba(10,250,18,1)","box-shadow":"2px 7px 50px 30px rgba(10,250,18,1)","top":"55","height":"110","width":"30","left":"50","background-color":"rgba(10,250,18,1)"});	
			
			$(".playerCount").css({"text-shadow":"-2px 0 green, 0 1px green, 1px 0 green, 0 -1px green"});
			//display the light when hovering a player
			playerSelectorOn(phase,myRole);	
			
		}

	}else if(phase == "Eliminate"){ //start of eliminate phase
	
		addMessage("<span style='color: gray; font-style: italic;'>-- Eliminate " + day + " --</span><br>","all");
		$(".playerLight2").css({"-webkit-box-shadow":"2px 7px 50px 30px rgba(209,57,11,1)","-moz-box-shadow":"2px 7px 50px 30px rgba(209,57,11,1)","box-shadow":"2px 7px 50px 30px rgba(209,57,11,1)","top":"55","height":"110","width":"30","left":"50","background-color":"rgba(209,57,11,1)"});
		
		if(myAlive == 1){

			if(eliminator == mySeat){  //if im the eliminator.. give me selection options

				//update phase guide
				$("#phaseDesc").html("Aim cannon... ");
				$("#selection").html("(click player)");
				
				//change player light to ORANGE for eliminator...
				$(".playerLight").css({"-webkit-box-shadow":"2px 7px 50px 30px rgba(209,57,11,1)","-moz-box-shadow":"2px 7px 50px 30px rgba(209,57,11,1)","box-shadow":"2px 7px 50px 30px rgba(209,57,11,1)","top":"55","height":"110","width":"30","left":"50","background-color":"rgba(209,57,11,1)"});
				
				//display the light when hovering a player
				playerSelectorOn(phase,myRole);
				
			}else{ //im not eliminator, just wait
				
				$("#phaseDesc").html("Elimination... ");
				
			}

		}else{
			
			$("#phaseDesc").html("Elimination... ");
			
		}
		
	}else if(phase == "Evening"){ //start of evening phase
	
		addMessage("<span style='color: gray; font-style: italic;'>-- Evening " + day + " --</span><br>","all");
		
		$(".bg").fadeOut();
		$("#bgEvening").fadeIn();
		$("#background_s").css("background-color","#061310");
		$("#background_nw").css("background-color","black");			
		
		if(myAlive == 1){
			
			$("#sendMessage").prop({"disabled":true,"placeholder":"sleeping..."}); //disable all chat during evening...
			
			if(myRole == "Seer" || myRole == "Protector" || myRole == "Trapper" || myRole == "Hypnotist" && myCharges > 0){
				
				if((hypnotized != 0 && (hypnotized != mySeat)) || hypnotized == 0){ //im not hypnotized
					
					//if im special, go through each player (not myself), change their image to sleeping..
					$(".player").each(function(){
						
						var d = $(this).attr("id");
						var seat = parseInt(d.substr(6,1));	
						if(mySeat != seat){
							
							var img = $(this).css("background-image");
							var newImg = img.replace("sheep","sleepingsheep").replace("wolf","sleepingwolf"); //show sleeping version of what they are
							$(this).css("background-image",newImg);
							
						}
						
						//console.log("SPECIAL1 " + d + " " + seat + " " + img + " " + newImg);
						
					});
					
					$(".playerLight").css({"-webkit-box-shadow":"2px 7px 50px 30px rgba(28,149,230,1)","-moz-box-shadow":"2px 7px 50px 30px rgba(28,149,230,1)","box-shadow":"2px 7px 50px 30px rgba(28,149,230,1)","top":"130","height":"30","width":"40","left":"45","background-color":"rgba(28,149,230,1)"});
					$(".playerLight2").css({"-webkit-box-shadow":"2px 7px 50px 30px rgba(28,149,230,1)","-moz-box-shadow":"2px 7px 50px 30px rgba(28,149,230,1)","box-shadow":"2px 7px 50px 30px rgba(28,149,230,1)","top":"130","height":"30","width":"40","left":"45","background-color":"rgba(28,149,230,1)"});
					playerSelectorOn(phase,myRole);
				
				
					if(myRole == "Seer"){
						
						$("#phaseDesc").html("See a player... ");
						$("#selection").html("(click player)");

					}else if(myRole == "Protector"){
						
						$("#phaseDesc").html("Protect a player?... ");
						$("#selection").html("(click player)");
			
					}else if(myRole == "Trapper"){
						
						$("#phaseDesc").html("Trap a player?... ");
						$("#selection").html("(click player)");

					}else if(myRole == "Hypnotist"){
						
						$("#phaseDesc").html("Hypnotize a player?... ");
						$("#selection").html("(click player)");
						
					}						
					
				}else{
	
					$(".player").each(function(){
						
						var d = $(this).attr("id");
						var seat = parseInt(d.substr(6,1));	
						var img = $(this).css("background-image");
						if(img.indexOf("sleeping") == -1){ //if not sleeping, sleep them
							var newImg = img.replace("sheep","sleepingsheep").replace("wolf","sleepingwolf"); //show sleeping version of what they are
							$(this).css("background-image",newImg);
						}
						
					});		
					
				}

			}else{ //not special or dont have charges so sleep everyone...
				
				$("#phaseDesc").html("Sleeping... ");
				
				$(".player").each(function(){
					
					var d = $(this).attr("id");
					var seat = parseInt(d.substr(6,1));	
					var img = $(this).css("background-image");
					if(img.indexOf("sleeping") == -1){ //if not sleeping, sleep them
						var newImg = img.replace("sheep","sleepingsheep").replace("wolf","sleepingwolf"); //show sleeping version of what they are
						$(this).css("background-image",newImg);
					}
					
				});				

			}	
			
		}else{ //im dead or spectating, sleep everyone
			
			$("#phaseDesc").html("Evening... ");
			
			$(".player").each(function(){
				
				var d = $(this).attr("id");
				var seat = parseInt(d.substr(6,1));	
				var img = $(this).css("background-image");
				if(img.indexOf("sleeping") == -1){ //if not sleeping, sleep them
					var newImg = img.replace("sheep","sleepingsheep").replace("wolf","sleepingwolf"); //show sleeping version of what they are
					$(this).css("background-image",newImg);
				}
				
			});			
			
		}
		
	}else if(phase == "Night"){ //start of night phase
	
		$(".bg").fadeOut();
		$("#bgNight").fadeIn();
		$("#background_s").css("background-color","#061310");
		$("#background_nw").css("background-color","black");			
	
		addMessage("<span style='color: gray; font-style: italic;'>-- Night " + day + " --</span><br>","all");		
		
		if(myAlive == 1){
			
			$("#sendMessage").prop({"disabled":true,"placeholder":"sleeping..."}); //disable all chat, because ppl are sleeping

			if(myTeam == "w"){
				
				//if all chat is showing, switch to wolfchat
				if($("#wolfChat").is(":visible") == false) $("#toggleChat").click();

				$(".player").each(function(){
					
					var d = $(this).attr("id");
					var seat = parseInt(d.substr(6,1));	
					var img = $(this).css("background-image");
					
					if(img.indexOf("sheep") != -1){ //if they're a sheep, give them sleeping image
						
						$(this).css("background-image","url('../../../public/images/sleepingsheep.png')"); //sleep sheep
						
					}else if(img.indexOf("wolf") != -1){ //if they a wolf, awaken them
						
						$(this).css("background-image","url('../../../public/images/wolf.png')"); //awaken wolves
						
					}
					
				});		

				//change to purple for wolves...
				$(".playerLight").css({"-webkit-box-shadow":"2px 7px 50px 30px rgba(132,28,230,1)","-moz-box-shadow":"2px 7px 50px 30px rgba(132,28,230,1)","box-shadow":"2px 7px 50px 30px rgba(132,28,230,1)","top":"130","height":"30","width":"40","left":"45","background-color":"rgba(132,28,230,1)"});
				$(".playerLight2").css({"-webkit-box-shadow":"2px 7px 50px 30px rgba(132,28,230,1)","-moz-box-shadow":"2px 7px 50px 30px rgba(132,28,230,1)","box-shadow":"2px 7px 50px 30px rgba(132,28,230,1)","top":"130","height":"30","width":"40","left":"45","background-color":"rgba(132,28,230,1)"});
				
				$(".playerCount").css({"text-shadow":"-2px 0 purple, 0 1px purple, 1px 0 purple, 0 -1px purple"});
				
				if(myRole == "Recruiter" && myCharges > 0){ //possibly recruit someone
					
					$("#phaseDesc").html("<span id='rec_eat'><u>Eat player?</u></span> or <span id='rec_rec'><u>Recruit player?</u></span>");
					
					$("#rec_eat").click(function(){
						$("#phaseDesc").html("Eat someone... ");
						$("#selection").html("(click player)");
						playerSelectorOn(phase,myRole);
					});
					
					$("#rec_rec").click(function(){
						$("#phaseDesc").html("Recruit a Sheep... ");
						$("#selection").html("(click player)");
						playerSelectorOn("recruiting",myRole);						
					});
					
				}else{ //eat normally
				
					$("#phaseDesc").html("Eat someone... ");
					$("#selection").html("(click player)");
					playerSelectorOn(phase,myRole);
					
				}

			}else{
				
				$("#phaseDesc").html("Sleeping...");
				//$(".playerBox").hide(); //hide everyone
				//$(".deadPlayerBox").hide(); //hide dead too
				
				$(".player").each(function(){
					
					var d = $(this).attr("id");
					var seat = parseInt(d.substr(6,1));	
					var img = $(this).css("background-image");
					if(img.indexOf("sleeping") == -1){ //if not sleeping, sleep them
						var newImg = img.replace("sheep","sleepingsheep").replace("wolf","sleepingwolf"); //show sleeping version of what they are
						$(this).css("background-image",newImg);
					}
					
					//console.log("NOTWOLF1 " + d + " " + seat + " " + img + " " + newImg);
					
				});				
				
			}		
			
		}else{ // im dead or spectating, so sleep everybody...
			
			$("#phaseDesc").html("Night...");
			
			$(".player").each(function(){
				
				var d = $(this).attr("id");
				var seat = parseInt(d.substr(6,1));	
				var img = $(this).css("background-image");
				if(img.indexOf("sleeping") == -1){ //if not sleeping, sleep them
					var newImg = img.replace("sheep","sleepingsheep").replace("wolf","sleepingwolf"); //show sleeping version of what they are
					$(this).css("background-image",newImg);
				}
				
				//console.log("NOTWOLF1 " + d + " " + seat + " " + img + " " + newImg);
				
			});
			
		}
			
	}else if(phase == "End"){
		
		//clear timer...  
		
	}
	
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function die(type){

	myAlive = 0;

	//Death screen images.. diedHow.png
	
	if(type == "eaten"){
		
		$("#diedTitle").html("You were Eaten!");
		$("#diedImage").css("background-image","url('../../../public/images/diedEaten.png')");
		
	}else if(type == "exploded"){
		
		$("#diedTitle").html("You were Exploded!");
		$("#diedImage").css("background-image","url('../../../public/images/diedExploded.png')");		
		
	}else if(type == "trapped"){
		
		$("#diedTitle").html("You got booby trapped!");
		$("#diedImage").css("background-image","url('../../../public/images/diedExploded.png')");		
		//should be "diedTrapped.png"
	}
	
	$("#died").show();	

	initSpectatorChat();
	
	
}

function initSpectatorChat(){
	
	$("#wolfChat").remove();
	$("#wolfSend").remove();	
	$("#toggleChat").remove();
	$("#wolfSendButton").remove();
	$("#chatMessages").show();
	$("#sendMessage").show();
	$("#sendMessageButton").show();
	
	$("#sendMessage").attr("placeholder","to spectators...");

	$("#sendMessageButton").unbind();
	$("#sendMessageButton").click(function(){
		
		//filter, validate make sure not spamming etc....
		if(messageCounter >= 8){ //if spam, 10 (change here <--) messages per 10 seconds
			
			$("#sendMessage").val("");
			addMessage("spam","spam");
			
		}else{		

			var message = $("#sendMessage").val();
			
			if(message.length > 0){
				
				$("#sendMessage").val("");
				
				//addMessage("<span style='color: gray;'>" + username + ": " + message + "</span><br>","all");
				
				//$("#chatMessages").mCustomScrollbar("scrollTo","last");
				
				console.log("SPEC CHAT " + game_id + " " + username + " " + rand_id + " " + message);
				
				socket.emit("chatMessage",{
					
					game_id: game_id,
					type: "spectate",
					username: username,
					rand_id: rand_id,
					message: message,
					
				});
				
				messageCounter++;
				
			}
		
		}		
		
	});
	
}


function playerSelectorOn(phase,myRole){
	
	if(myAlive == 1 && rand_id != "spectate" && (hypnotized != mySeat)){ //cant select players if ya dead or spectating, or hypnotized
	
		//COME BACK, if wolf, cant select wolves,  if seer cant pick seen players... etc..
		$(".player").hover(
		function(){
			$(this).siblings(".playerLight").show();
			
		},function(){ //light off when moving off that player
			$(this).siblings(".playerLight").hide();
				
		});
		
		$(".player").click(function(){
			
			//check if selection is made...
			var currSelection = $("#selection").html();
			var selection = $(this).siblings(".playerInfo").find(".playerInfoUsername").html();
			var rSelectionSeat = $(this).attr("id");
			var selectionSeat = parseInt(rSelectionSeat.substr(6,1));	
			
			if(currSelection != selection){ //if you are changing your selection
				
				if(selection != username){ //and not selecting yourself
					
					$("#selection").html("<span style='color: " + color[selectionSeat] + ";'>" + selection + "</span>");
					var light = document.getElementById("player" + currSelection);
					$(".playerLight2").hide();
					$(this).siblings(".playerLight2").show();
					
					socket.emit("selectPlayer",{
					
						game_id: game_id,
						seat: mySeat,
						rand_id: rand_id,
						selection: selectionSeat,
						phase: phase,
					
					});						
				}

			}else{

				$("#selection").html("");
				var light = document.getElementById("player" + selectionSeat + "Light2");
				$(light).hide();
				
				socket.emit("selectPlayer",{
				
					game_id: game_id,
					seat: mySeat,
					rand_id: rand_id,
					selection: 0,
					phase: phase,
				
				});						
				
			}

		});	

	}
	
}

$("#killGame").click(function(){
	
	socket.emit("killGame","HI");
	
});


function playerSelectorOff(){
	
	$(".player").unbind();
	$(".deadPlayer").unbind();
	
	$(".playerLight").hide();
	$(".playerLight2").hide();
	
	$(".playerStatus").html();
	
}


socket.on("newMessage",function(data){
	
	addMessage("<span style='color: " + color[data.seat] + ";'>" + data.sender + "</span>: " + data.msg + "<br>",data.type);

});


socket.on("currSelections",function(data){
	
	if(phase == "Suspect" || phase == "Trust"){
		
		currSelections = data;

		$(".playerCount").html("");
			
		for(var i in data){ // i = seat number
			
			if(data.hasOwnProperty(i)){
				
				if(i > 0 && i < 10){
					
					if(data[i] > 0){ //if more than 0 votes on a player...
						
						var div = document.getElementById("player" + i + "Count");
						$(div).html(data[i]);
						
						
					}		
						
				}
				
			}
			
		}

		
	}else if(phase == "Eliminate"){
		
		if(data > 0){
			
			var light = document.getElementById("player" + data + "Light2");
			$(".playerLight2").hide();
			$(light).show();
			
		}
		
	}else if(phase == "Night" && myTeam == "w"){
			
		$(".playerCount").html("");
			
		for(var i in data){ // i = seat number
			
			if(data.hasOwnProperty(i)){
				
				if(i > 0 && i < 10){
					
					if(data[i] > 0){ //if more than 0 votes on a player...
						
						var div = document.getElementById("player" + i + "Count");
						$(div).html(data[i]);
						
						
					}		
						
				}
				
			}
			
		}	
		
	}
	

});


//SEND TO SERVER

$("#sendMessageButton").click(function(){
	
	//filter, validate make sure not spamming etc....
	
	if(messageCounter >= 8){ //if spam, 10 (change here <--) messages per 10 seconds
		
		$("#sendMessage").val("");
		//tell them they're spamming??
	}else{
		
		var message = $("#sendMessage").val();
		
		if(message.length > 0 && message.length < 160){
			
			$("#sendMessage").val("");
			
			//addMessage("<span style='color: " + color[mySeat] + ";'>" + username + "</span>: " + message + "<br>","all");
			
			$("#chatMessages").mCustomScrollbar("scrollTo","last");
			
			socket.emit("chatMessage",{
				
				game_id: game_id,
				seat: mySeat,
				type: "all",
				rand_id: rand_id,
				message: message,
				
			});
			
			messageCounter++;
			
		}		
		
	}
	
});

$("#sendMessage").keypress(function(e){
	
	if(e.which == 13){
		e.preventDefault();
		$("#sendMessageButton").click();
	} 
	
});


var timeTicker = setInterval(function(){
	
	if(timer > 0)	timer--;

	$("#phaseTimer").html(timer);
	
},1000); //1 second

var mcr = setInterval(function(){ //for chat spam
	
	messageCounter = 0;
	
},10000); //10 seconds



//[ i ] box

$(".playerInfoButton").click(function(){
	
	$("#playerProfileBox").show();

	var shown = $("#playerProfileBox").css("display");
		
	$("#playerSelectionSummary").html(""); //clear
	
	var id = $(this).prop("id");
	var seat = id.substr(6,1);
	
	var loopDay = 1;
	
	var gamePhases = ["Suspect","Trust"];
	
	console.log("INFO " + seat);
	
	//days
	while(loopDay <= day){
		
		$("#playerSelectionSummary").append("<br>Day " + loopDay + "<br>");
		
		//phases
		for(var i = 0; i < gamePhases.length; i++){
		
			var ph = gamePhases[i];
			
			//$("#playerSelectionSummary").append("&nbsp;&nbsp;&nbsp;" + ph + "<br>");
			
			//my suspect
			for(var i2 = 0; i2 < selections.length; i2++){
			
				var s = selections[i2];
				
				if(s){
					
					console.log("LOTS2 --- " + s.day + " " + loopDay + " " + s.phase + " " + ph + " " + s.voterSeat + " " + seat);
				
					if(s.day == loopDay && s.phase == ph && s.voterSeat == seat){
						
						console.log(s.voter + " " + s.voted_for);
						
						if(ph == "Suspect"){						
							$("#playerSelectionSummary").append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Suspected &rarr; " + s.voted_for + "<br>");
						}else if(ph == "Trust"){
							$("#playerSelectionSummary").append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Trusted &rarr; " + s.voted_for + "<br>");
						}

					}
					
				}
		
			}
			
			//suspected by
			for(var i3 = 0; i3 < selections.length; i3++){
			
				var s = selections[i3];
				
				if(s){
					
					console.log("LOTS3 --- " + s.day + " " + loopDay + " " + s.phase + " " + ph + " " + s.voted_forSeat + " " + seat);
					
					if(s.day == loopDay && s.phase == ph && s.voted_forSeat == seat){
						
						if(ph == "Suspect"){						
							$("#playerSelectionSummary").append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Suspected by &larr; " + s.voter + "<br>");
						}else if(ph == "Trust"){
							$("#playerSelectionSummary").append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Trusted by &larr; " + s.voter + "<br>");				
						}
					}						
					
				}

			}

		}

		loopDay++;
		
	}
	
	$("#playerSelectionSummary").mCustomScrollbar("update");
	
});

$("#closePlayerProfile").click(function(){
	
	$("#playerProfileBox").hide();
	
});

function createWolfChat(){
	
	$("#toggleChat").show();
	
	$("#toggleChat").click(function(){

		if($("#wolfSend").is(":visible")) $("#toggleChat").html("Wolf Chat");
		else $("#toggleChat").html("&larr; All Chat");
	
		$("#wolfChat").toggle();
		$("#wolfSend").toggle();
		$("#wolfSendButton").toggle();
		$("#chatMessages").toggle();
		$("#sendMessageButton").toggle();
		$("#sendMessage").toggle();
		$("#chatMessages").mCustomScrollbar("scrollTo","last");
		$("#chatMessages").mCustomScrollbar("update");
		$("#wolfChat").mCustomScrollbar("scrollTo","last");
		$("#wolfChat").mCustomScrollbar("update");			
		newWolfMessages = 0;
		$("#newWolfMessages").html("");
	});
	
	
	$("#wolfChat .mCSB_container").append("<span style='color: gray;'>-- Wolf Chat --</span><br>");
	
	$("#wolfSendButton").click(function(){
		
		//filter, validate make sure not spamming etc....
		if(messageCounter >= 8){ //if spam, 10 (change here <--) messages per 10 seconds
			
			$("#sendMessage").val("");
			//tell them they're spamming??
		}else{

			var message = $("#wolfSend").val();
			
			if(message.length > 0){
				
				$("#wolfSend").val("");
				
				//addMessage("<span style='color: " + color[mySeat] + ";'>" + username + "</span>: " + message + "<br>","wolf");
				
				//$("#wolfChat").mCustomScrollbar("scrollTo","last");
				
				socket.emit("chatMessage",{
					
					game_id: game_id,
					seat: mySeat,
					type: "wolf",
					rand_id: rand_id,
					message: message,
					
				});
				
				messageCounter++;
				
			}
		}		
		
	});
	
	$("#wolfSend").keypress(function(e){
		
		if(e.which == 13){
			e.preventDefault();
			$("#wolfSendButton").click();
		} 
		
	});	

}





var firstScroll = 0;
function addMessage(msg,type){

	if(type == "all" || type == "spectate"){
		
		//console.log("FS " + firstScroll);
		var sH = $("#chatMessages").prop("scrollHeight"); //382

		var drH = $("#chatMessages .mCSB_dragger").height();
		var rdrT = $("#chatMessages .mCSB_dragger").css("top");
		
		$("#chatMessages").mCustomScrollbar("update");
		//console.log("dragger " + drH);
		//console.log("dragger from Top " + rdrT);
		//console.log("scroll Height " + sH);
			
		if(drH < (sH-14) && drH != 30 && firstScroll == 0){ //30 and 14 because scrollbar plugin is doing something weird...
			firstScroll = 1;
			$("#chatMessages").mCustomScrollbar("scrollTo","last");
		}
			
		
		var len = rdrT.length; 
		
		var drT = parseInt(rdrT.substr(0,len-2));
		var pad = 4;
		//console.log("drt" + drT);
		
		$("#chatMessages .mCSB_container").append(msg);
		
		if((drH + drT + pad) == sH){ //if scrollbar is at bottom
			
			//
			$("#chatMessages").mCustomScrollbar("scrollTo","last"); //keep at bottom
			//var upd = setTimeout(function(){$("#chatMessages").mCustomScrollbar("update");},300);
			
		}else{
			
			$("#chatMessages").mCustomScrollbar("update");
			
		}

		
	}else if(type == "wolf"){
		
		//console.log("FS " + firstScroll);
		var sH = $("#wolfChat").prop("scrollHeight"); //382

		var drH = $("#wolfChat .mCSB_dragger").height();
		var rdrT = $("#wolfChat .mCSB_dragger").css("top");
		
		$("wolfChat").mCustomScrollbar("update");
		//console.log("dragger " + drH);
		//console.log("dragger from Top " + rdrT);
		//console.log("scroll Height " + sH);
			
		if(drH < (sH-14) && drH != 30 && firstScroll == 0){ //30 and 14 because jquery plugin is doing something...
			firstScroll = 1;
			//console.log("Heillo 2");
			//var sL = setTimeout(function(){$("#chatMessages").mCustomScrollbar("scrollTo","last");},2000);
			$("#wolfChat").mCustomScrollbar("scrollTo","last");
		}
			
		
		var len = rdrT.length; 
		
		var drT = parseInt(rdrT.substr(0,len-2));
		var pad = 4;
		//console.log("drt" + drT);
		
		$("#wolfChat .mCSB_container").append(msg);
		
		if($("#wolfChat").is(":visible") == false){
			
			console.log("visible working");
			newWolfMessages++;
			$("#newWolfMessages").html(" (" + newWolfMessages + ")");
			
		}
		
		if((drH + drT + pad) == sH){ //if scrollbar is at bottom
			
			//
			$("#wolfChat").mCustomScrollbar("scrollTo","last"); //keep at bottom
			//var upd = setTimeout(function(){$("#chatMessages").mCustomScrollbar("update");},300);
			
		}else{
			
			$("#wolfChat").mCustomScrollbar("update");
			
		}		
		
	}
	

	

}



$("#testOp").change(function(){
	
	console.log($(this).val());
	
});



$("#testDied").click(function(){
	$("#died").toggle();
});

$("#testGameEnd").click(function(){
	$("#gameEnd").toggle();
});

$("#toLobbyButton").click(function(){
	window.location.replace("http://localhost:2000/ui");
});

$("#gameEndReturn").click(function(){
	window.location.replace("http://localhost:2000/ui");
});

$("#watchGameButton").click(function(){
	$("#died").hide();
});

/*

$(window).resize(function(){

});

*/