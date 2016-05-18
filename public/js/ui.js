//global variables
var idleTime = 0;
var storeLoaded = 0; //if you buy a new skin, set back to 0 so skins are reloaded... otherwise don't need to reload each time viewing the page.
var restockTime;
var queueTime;

//HOME BUTTON
$("#header_logo").click(function(){
	$(".wrapper").css("display","none");
	$("#play_wrapper").css("display","block");
	$("#play_button").css({"color":"#004d39","text-shadow":"-1px 0 gray, 0 1px gray, 1px 0 gray, 0 -1px gray"});
	$("#store_button").css({"color":"green","text-shadow":"-1px 0 yellow, 0 1px yellow, 1px 0 yellow, 0 -1px yellow"});
});

$("#header_logo_text").click(function(){
	$(".wrapper").css("display","none");
	$("#play_wrapper").css("display","block");
	$("#play_button").css({"color":"#004d39","text-shadow":"-1px 0 gray, 0 1px gray, 1px 0 gray, 0 -1px gray"});
	$("#store_button").css({"color":"green","text-shadow":"-1px 0 yellow, 0 1px yellow, 1px 0 yellow, 0 -1px yellow"});
});

//PLAY BUTTON
$("#play_button").click(function(){
	$(".wrapper").css("display","none");
	$("#play_wrapper").css("display","block");
	$("#play_button").css({"color":"#004d39","text-shadow":"-1px 0 gray, 0 1px gray, 1px 0 gray, 0 -1px gray"});
	$("#store_button").css({"color":"green","text-shadow":"-1px 0 yellow, 0 1px yellow, 1px 0 yellow, 0 -1px yellow"});
});

//STORE BUTTON
$("#store_button").click(function(){

	$(".wrapper").css("display","none");
	$("#store_wrapper").css("display","block");
	$("#play_button").css({"color":"red","text-shadow":"-1px 0 orange, 0 1px orange, 1px 0 orange, 0 -1px orange"});
	$("#store_button").css({"color":"#004d39","text-shadow":"-1px 0 gray, 0 1px gray, 1px 0 gray, 0 -1px gray"});
	
	//load store... cache results?
	
	if(storeLoaded == 0) loadStore(); //get all skins, compare against my skins, if i dont own the skin show it to me in the store
		
});

//MASK
$("#mask").click(function(){
	$("#mask").hide();
	$("#popup_small").hide();
	$("#friend_profile").hide();
	$("#my_profile").hide();
	$("#confirm_buy").hide();
	$("#buy_gold").hide();
	$("#join_game_options").hide();
});

function loadStore(){ //this function loads skins in the store AND character customization screen at same time
	
	$.ajax({
		type: "GET"
		,url: "/ajax/store"
		,success: function(info){
			
			var storeItems = JSON.parse(info);
			var storeSkins = "";
			var boosts = "";
			
			var owned = {};
				owned["Head"] = "";
				owned['Eyes'] = "";
				owned['Face'] = "";
				owned['Body'] = "";
				owned['Feet'] = "";
			var notOwned = {};
				notOwned["Head"] = "";
				notOwned['Eyes'] = "";
				notOwned['Face'] = "";
				notOwned['Body'] = "";
				notOwned['Feet'] = "";
			var counts = {};
				counts["Head"] = 0;
				counts["Eyes"] = 0;
				counts["Face"] = 0;
				counts["Body"] = 0;
				counts["Feet"] = 0;	
			
			
			for(var i = 0; i < storeItems.length; i++){

				var item = storeItems[i];
				
				if(item.type == "skin"){
					
					var skinName = item.name;
					var friendlyName = skinName.replace(/\ /g,"_"); //change Wizard Hat to Wizard_Hat
					var ownedSkin = 0;
					
					for(var i2 = 0; i2 < mySkins.length; i2++){
						
						//only show skins I don't own already.
						var mySkin = mySkins[i2];
						if(mySkin == skinName){
							ownedSkin = 1;
							break;
						}
						
					}
					
					if(ownedSkin == 1){
						
						//for character screen
						if(mySettings[item.category] == skinName){ //give diff HTML if it's the skin I have selected
							
							owned[item.category] = owned[item.category] + "<div class='cs_skin cs_owned cs_selected' id='skin_" + friendlyName + "'><div class='cs_checkmark'>&#x2713;</div><div id='cat'>" + item.category + "</div>" + friendlyName + "</div>";
						
						}else{ //owned but not selected
						
							owned[item.category] = owned[item.category] + "<div class='cs_skin cs_owned' id='skin_" + friendlyName + "'>" + friendlyName + "<div id='cat'>" + item.category + "</div></div>";
						
						}

						counts[item.category]++;
						
					}else{
						
						notOwned[item.category] = notOwned[item.category] + "<div class='cs_skin cs_notOwned' id='skin_" + friendlyName + "'><div class='cs_skin_locked'>&#128274;</div><div id='cat'>" + item.category + "</div>" + friendlyName + "</div>";
						counts[item.category]++;
						
						//not owned skins also go in the store
						var escBuy = '"' + item.name + '","' + friendlyName + '","skin","' + item.category + '",' + item.price;
						
						storeSkins = storeSkins + "<div class='store_item_skin'><div class='skin_image' id='skin_" + friendlyName + "'></div><div class='skin_desc'>" + skinName + "<br>" + item.category + " / " + item.tier + "</div><div class='skin_price'>" + item.price + "</div><div class='buy_button skin_buy' onClick='buy(" + escBuy + ");'>Unlock</div></div>";
						
					}					

				}else if(item.type == "boost"){

					boosts += "<div class='store_item store_boost'><div class='boost_img'></div><div class='boost_title'>" + item.name + "</div><div class='boost_price'>" + item.price + "g</div><div class='buy_button boost_buy'>Unlock</div></div>";

				}

			}
			
			//add to store
			$("#ss_content .mCSB_container").html(storeSkins); //add props
			$("#boost_content .mCSB_container").html(boosts); //add boosts
			
			//add to character screen
			$("#Head_container").width(counts["Head"] * 91);  //80 = width of each skin 'square'
			$("#Head_container").html(owned["Head"] + notOwned["Head"]);
			
			$("#Eyes_container").width(counts["Eyes"] * 91);
			$("#Eyes_container").html(owned["Eyes"] + notOwned["Eyes"]);
			
			$("#Face_container").width(counts["Face"] * 91);
			$("#Face_container").html(owned["Face"] + notOwned["Face"]);

			$("#Body_container").width(counts["Body"] * 91);
			$("#Body_container").html(owned["Body"] + notOwned["Body"]);

			$("#Feet_container").width(counts["Feet"] * 91);
			$("#Feet_container").html(owned["Feet"] + notOwned["Feet"]);			
			
			//initiate click functions...
			
			$(".cs_owned").click(function(){
			
				setSkin($(this));
				
			});	

			$(".cs_selected").click(function(){
			
				unsetSkin($(this));
				
			});
			
			storeLoaded = 1;

		}

	});	
	
}



function unsetSkin(t){
	
	console.log("UN-SETTING" + t);
	
	var rName = $(t).attr("id"); //skin_Wizard_Hat
	var className = rName.substr(5,100); //replace to Wizard_Hat
	var skinDivs = document.getElementsByClassName(className);
	var cat = $(t).find("#cat").html();
	$(t).find(".cs_checkmark").remove();

	$(t).addClass("cs_owned").removeClass("cs_selected");
	
	$(t).unbind();
	$(t).click(function(){  setSkin(t); }); 

	$("#sheep_preview").find(skinDivs).remove();
	$("#wolf_preview").find(skinDivs).remove();
	
	$("#mpc_notify").hide(); //unsave
	$("#mpc_save").show(); //offer to save
	
	tempSettings[cat] = "";
	
}

function setSkin(t){
	
	console.log("SETTING" + t);
	
	var rName = $(t).attr("id"); //skin_Wizard_Hat
	var className = rName.substr(5,100); //replace to Wizard_Hat
	var name = className.replace(/\_/g," ");
	var cat = $(t).find("#cat").html(); //Head
	
	var divsToRemove = document.getElementsByClassName("my" + cat);
	
	//remove category from sheep/wolf preview
	$("#sheep_preview").find(divsToRemove).remove();
	$("#wolf_preview").find(divsToRemove).remove();
	
	//remove checkmark and change classes of other selected skin
	var cont = document.getElementById(cat + "_container");
	$(cont).find(".cs_checkmark").remove();
	var currSelected = $(cont).find(".cs_selected");
	$(cont).find(".cs_selected").unbind().addClass("cs_owned").removeClass("cs_selected").click(function(){ setSkin($(this)); });
	
	//add skin to sheep / wolf preview
	$("#sheep_preview").append("<div class='skin my" + cat + " " + className + "'></div>");
	$("#wolf_preview").append("<div class='skin my" + cat + " " + className + "'></div>");
	
	$(t).addClass("cs_selected").append("<div class='cs_checkmark'>&#x2713;</div>").unbind().click(function(){	unsetSkin(t); });
	
	$("#mpc_notify").hide(); //unsave
	$("#mpc_save").show(); //offer to save

	//update tempSettings	
	tempSettings[cat] = name;
		
}


$("#mpc_save").click(function(){
	
	//send settings to server
	$.ajax({
		
		type: "GET"
		,url: "/ajax/setCharacter"
		,data: {head: tempSettings["Head"], eyes: tempSettings["Eyes"], face: tempSettings["Face"], body: tempSettings["Body"], feet: tempSettings["Feet"]}
		
	});
	
	mySettings["Head"] = tempSettings["Head"];
	mySettings["Eyes"] = tempSettings["Eyes"];
	mySettings["Face"] = tempSettings["Face"];
	mySettings["Body"] = tempSettings["Body"];
	mySettings["Feet"] = tempSettings["Feet"];	
	
	$("#mpc_notify").show();
	$("#mpc_save").hide(); //offer to save
	
});



$("#header_profile_button").mouseenter(function(){
	setTimeout(function(){
		$("#header_profile_menu").css("display","block");
	},100);
});

$("#header_profile_button").mouseleave(function(){
	setTimeout(function(){
		var h = $('#header_profile_menu:hover').length;
		if(h == 0){
			$("#header_profile_menu").css("display","none");
		}},100);
});

$("#header_profile_menu").mouseleave(function(){
	//is house hovering menu, if yes do nothing, if no close it
	setTimeout(function(){
		var h = $("#header_profile_button:hover").length;
		if(h == 0){
			$("#header_profile_menu").css("display","none");
		}
	},100);
});

$("#header_profile_button").click(function(){
	$("#mask").css("display","block");
	$("#my_profile").css("display","block");
	mpCharacter();
});

$("#header_menu_character").click(function(){
	$("#mask").css("display","block");
	$("#my_profile").css("display","block");
	mpCharacter();
});

$("#header_menu_stats").click(function(){
	$("#mask").css("display","block");
	$("#my_profile").css("display","block");
	mpStats();
});

$("#header_menu_history").click(function(){
	$("#mask").css("display","block");
	$("#my_profile").css("display","block");
	mpHistory();
});

$("#header_menu_inventory").click(function(){
	$("#mask").css("display","block");
	$("#my_profile").css("display","block");
	mpInventory();
});

$("#header_menu_account").click(function(){
	$("#mask").css("display","block");
	$("#my_profile").css("display","block");
	mpAccount();
});

$("#header_menu_logout").click(function(){
	window.location.replace("http://localhost:2000/logout");
});

function mpCharacter(){

	$(".mph").css({"-webkit-box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","-moz-box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","border":"3px solid black"});
	$("#mph_character").css({"-webkit-box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","-moz-box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","border-bottom":"0px solid black"});
	$(".mp").css("display","none");
	$("#mp_character").css("display","block");
	
	$(".character_settings").css("display","none");
	$("#head_settings").css("display","block");
	
	$("#head_selector").css("font-weight","bold");
	
	//load character images with settings you have selected...
	if(mySettings["Feet"] != ""){
		var newFeet = mySettings["Feet"].replace(/\ /g,"_");
		$("#sheep_preview").append("<div class='skin myFeet " + newFeet + "'></div>");
		$("#wolf_preview").append("<div class='skin myFeet " + newFeet + "'></div>");		
	}
	
	if(mySettings["Body"] != ""){
		var newBody = mySettings["Body"].replace(/\ /g,"_");
		$("#sheep_preview").append("<div class='skin myBody " + newBody + "'></div>");
		$("#wolf_preview").append("<div class='skin myBody " + newBody + "'></div>");		
	}
	
	if(mySettings["Face"] != ""){
		var newFace = mySettings["Face"].replace(/\ /g,"_");
		$("#sheep_preview").append("<div class='skin myFace " + newFace + "'></div>");
		$("#wolf_preview").append("<div class='skin myFace " + newFace + "'></div>");		
	}	

	if(mySettings["Eyes"] != ""){
		var newEyes = mySettings["Eyes"].replace(/\ /g,"_");
		$("#sheep_preview").append("<div class='skin myEyes " + newEyes + "'></div>");
		$("#wolf_preview").append("<div class='skin myEyes " + newEyes + "'></div>");		
	}	
	
	if(mySettings["Head"] != ""){
		var newHead = mySettings["Head"].replace(/\ /g,"_");
		$("#sheep_preview").append("<div class='skin myHead " + newHead + "'></div>");
		$("#wolf_preview").append("<div class='skin myHead " + newHead + "'></div>");
	}

	if(storeLoaded == 0) loadStore();
	
	$("#mpc_save").show();
	$("#mpc_notify").hide();
	
	var st = setTimeout(function(){ $("#head_settings").mCustomScrollbar({theme:"dark-thick",scrollInertia: 0,alwaysShowScrollbar:1, axis:"x", advanced:{updateOnContentResize: false,	updateOnImageLoad: false},mouseWheel:{ preventDefault: true }}); },15);
	
}

$("#head_selector").click(function(){
	$(".setting_selector").css({"font-weight":"normal","border":"1px solid black"});
	$("#head_selector").css({"font-weight":"bold","text-decoration":"underline"});
	
	$(".character_settings").hide();
	$("#head_settings").show();
	
	$("#head_settings").mCustomScrollbar({theme:"dark-3",scrollInertia: 0,alwaysShowScrollbar:1, axis:"x", advanced:{updateOnContentResize: false,	updateOnImageLoad: false},mouseWheel:{ preventDefault: true }});
	
});

$("#eyes_selector").click(function(){
	$(".setting_selector").css({"font-weight":"normal","border":"1px solid black"});
	$("#eyes_selector").css({"font-weight":"bold","border":"1px solid black"});
	
	$(".character_settings").hide();
	$("#eyes_settings").show();

	$("#eyes_settings").mCustomScrollbar({theme:"dark-3",scrollInertia: 0,alwaysShowScrollbar:1, axis:"x", advanced:{updateOnContentResize: false,	updateOnImageLoad: false},mouseWheel:{ preventDefault: true }});
	
});

$("#face_selector").click(function(){
	$(".setting_selector").css({"font-weight":"normal","border":"1px solid black"});
	$("#face_selector").css({"font-weight":"bold","border":"1px solid black"});
	
	$(".character_settings").hide();	
	$("#face_settings").show();

	$("#face_settings").mCustomScrollbar({theme:"dark-3",scrollInertia: 0,alwaysShowScrollbar:1, axis:"x", advanced:{updateOnContentResize: false,	updateOnImageLoad: false},mouseWheel:{ preventDefault: true }});
});


$("#body_selector").click(function(){
	$(".setting_selector").css({"font-weight":"normal","border":"1px solid black"});
	$("#body_selector").css({"font-weight":"bold","border":"1px solid black"});
	
	$(".character_settings").hide();	
	$("#body_settings").show();

	$("#body_settings").mCustomScrollbar({theme:"dark-3",scrollInertia: 0,alwaysShowScrollbar:1, axis:"x", advanced:{updateOnContentResize: false,	updateOnImageLoad: false},mouseWheel:{ preventDefault: true }});
	
});

$("#feet_selector").click(function(){
	$(".setting_selector").css({"font-weight":"normal","border":"1px solid black"});
	$("#feet_selector").css({"font-weight":"bold","border":"1px solid black"});
	
	$(".character_settings").hide();
	$("#feet_settings").show();

	$("#feet_settings").mCustomScrollbar({theme:"dark-3",scrollInertia: 0,alwaysShowScrollbar:1, axis:"x", advanced:{updateOnContentResize: false,	updateOnImageLoad: false},mouseWheel:{ preventDefault: true }});
});

function mpStats(){

	$(".mph").css({"-webkit-box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","-moz-box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","border":"3px solid black"});
	$("#mph_stats").css({"-webkit-box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","-moz-box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","border-bottom":"0px solid black"});
	$(".mp").css("display","none");
	$("#mp_stats").css("display","block");
	
	
	$.ajax({
		type: "GET"
		,url: "/ajax/stats"
		,success: function(info){
			
			var st = JSON.parse(info);
			
			//combine to get totals
			var totalGames = st[0].s_games + st[0].w_games;
			var totalWins = st[0].s_wins + st[0].w_wins;
			var totalSurvived = st[0].s_games_survived + st[0].w_games_survived;
			var totalSus = st[0].s_suspected + st[0].w_suspected;
			var totalTru = st[0].s_trusted + st[0].w_trusted;
			
			$("#stats_all").html("Games Played: " + totalGames + "<br>Wins: " + totalWins + "<br>Games Survived: " + totalSurvived + "<br>Suspected: " + totalSus + "<br>Trusted: " + totalTru);
			$("#stats_sheep").html("<b>Sheep Stats</b><br>Games Played: " + st[0].s_games + "<br>Wins: " + st[0].s_wins + "<br>Games Survived: " + st[0].s_games_survived + "<br>Suspected: " + st[0].s_suspected + "<br>Trusted: " + st[0].s_trusted + "<br>Suspects Chosen: " + st[0].s_sus_chosen + "<br>Wolves Suspected: " + st[0].s_sus_chosen_correct + "<br>Players Trusted: " + st[0].s_tru_chosen + "<br>Sheep Trusted: " + st[0].s_tru_chosen_correct + "<br>Players Eliminated: " + st[0].s_elim + "<br>Wolves Eliminated: " + st[0].s_elim_correct);
			$("#stats_wolf").html("<b>Wolf Stats</b><br>Games Played: " + st[0].w_games + "<br>Wins: " + st[0].w_wins + "<br>Games Survived: " + st[0].w_games_survived + "<br>Suspected: " + st[0].w_suspected + "<br>Trusted: " + st[0].w_trusted + "<br>Sheep Eaten: " + st[0].w_eats + "<br>Special Sheep Eaten: " + st[0].w_spec_eats);
		
		}
		
	});
	
}

function mpHistory(){

	$(".mph").css({"-webkit-box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","-moz-box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","border":"3px solid black"});
	$("#mph_history").css({"-webkit-box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","-moz-box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","border-bottom":"0px solid black"});
	$(".mp").css("display","none");
	$("#mp_history").css("display","block");
	
	//ajax to load everything in..
	$.ajax({
		type: "GET"
		,url: "/ajax/history"
		,success: function(info){
		
			if(info == "No Games"){
				
				$("#mp_history").html("No Games");
				
			}else{
				
				$("#mp_history").html(info);
				console.log(info);
				var history = JSON.parse(info);
				
				for(var i = 0; i < history.length; i++){
					
					
					
				}
				
				
				
				
				
				
				
			}
			
		}
		
	});

}

function mpInventory(){

	$(".mph").css({"-webkit-box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","-moz-box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","border":"3px solid black"});
	$("#mph_inventory").css({"-webkit-box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","-moz-box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","border-bottom":"0px solid black"});
	$(".mp").css("display","none");
	$("#mp_inventory").css("display","block");
	
	//load inventory
	
}

function mpAccount(){

	$(".mph").css({"-webkit-box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","-moz-box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","box-shadow":"inset 0px -7px 30px 0px rgba(0,0,0,0.75)","border":"3px solid black"});
	$("#mph_account").css({"-webkit-box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","-moz-box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","box-shadow":"inset 0px -12px 0px -15px rgba(0,0,0,0.75)","border-bottom":"0px solid black"});
	$(".mp").css("display","none");
	$("#mp_account").css("display","block");
	
	//ajax to load everything in..

}


$("#mph_character").click(function(){
	mpCharacter();
});

$("#mph_stats").click(function(){
	mpStats();
});

$("#mph_history").click(function(){
	mpHistory();
});

$("#mph_inventory").click(function(){
	mpInventory();
});

$("#mph_account").click(function(){
	mpAccount();
});

$("#head_settings").click(function(){
	
});

$("#face_settings").click(function(){
	
});

$("#body_settings").click(function(){
	
});

$("#feet_settings").click(function(){
	
});



function initializeCustomsFilters(){

	

	$("#customs_checkbox_hats").change(function(){
	
		var checked = $(this).is(':checked');
		var faceDiv = document.getElementById("customs_checkbox_face");
		var face = $(faceDiv).is(':checked');
		var bodyDiv = document.getElementById("customs_checkbox_body");
		var body = $(bodyDiv).is(':checked');
		var footDiv = document.getElementById("customs_checkbox_footwear");		
		var footwear = $(footDiv).is(':checked');
		
		if(checked == true && face == false && body == false && footwear == false){
		
			$(".store_item_customs").css("display","none");
			$(".store_item_customs_Hats").css("display","block");
			
		}else{
		
			if(checked == false){
				$(".store_item_customs_Hats").css("display","none");
			}else{
				$(".store_item_customs_Hats").css("display","block");
			}
			
		}
		

	});
	
	$("#customs_checkbox_face").change(function(){
	
		var checked = $(this).is(':checked');
		var hatsDiv = document.getElementById("customs_checkbox_hats");
		var hats = $(hatsDiv).is(':checked');
		var bodyDiv = document.getElementById("customs_checkbox_body");
		var body = $(bodyDiv).is(':checked');
		var footDiv = document.getElementById("customs_checkbox_footwear");		
		var footwear = $(footDiv).is(':checked');
		
		if(checked == true && hats == false && body == false && footwear == false){
		
			$(".store_item_customs").css("display","none");
			$(".store_item_customs_Face").css("display","block");
			
		}else{
		
			if(checked == false){
				$(".store_item_customs_Face").css("display","none");
			}else{
				$(".store_item_customs_Face").css("display","block");
			}
			
		}
		
	});

	$("#customs_checkbox_body").change(function(){
	
		var checked = $(this).is(':checked');
		var hatsDiv = document.getElementById("customs_checkbox_hats");
		var hats = $(hatsDiv).is(':checked');
		var faceDiv = document.getElementById("customs_checkbox_face");
		var face = $(faceDiv).is(':checked');
		var footDiv = document.getElementById("customs_checkbox_footwear");		
		var footwear = $(footDiv).is(':checked');
		
		if(checked == true && hats == false && face == false && footwear == false){
		
			$(".store_item_customs").css("display","none");
			$(".store_item_customs_Body").css("display","block");
			
		}else{
		
			if(checked == false){
				$(".store_item_customs_Body").css("display","none");
			}else{
				$(".store_item_customs_Body").css("display","block");
			}
			
		}
		
	});

	$("#customs_checkbox_footwear").change(function(){
	
		var checked = $(this).is(':checked');
		var hatsDiv = document.getElementById("customs_checkbox_hats");
		var hats = $(hatsDiv).is(':checked');
		var faceDiv = document.getElementById("customs_checkbox_face");
		var face = $(faceDiv).is(':checked');
		var bodyDiv = document.getElementById("customs_checkbox_body");		
		var body = $(bodyDiv).is(':checked');
		
		if(checked == true && hats == false && face == false && body == false){
		
			$(".store_item_customs").css("display","none");
			$(".store_item_customs_Footwear").css("display","block");
			
		}else{
		
			if(checked == false){
				$(".store_item_customs_Footwear").css("display","none");
			}else{
				$(".store_item_customs_Footwear").css("display","block");
			}
			
		}
		
	});	
	
}


$("#cb_cancel").click(function(){
	$("#mask").css("display","none");
	$("#confirm_buy").css("display","none");
});

$("#cb_close").click(function(){
	$("#mask").css("display","none");
	$("#confirm_buy").css("display","none");
});

$("#cb_success").click(function(){
	
	$("#cb_close").click();
	$("#cb_success").hide();
	
});

function buy(name,friendlyName,type,category,price){
	
	$("#cb_success").hide();
	
	if(type == "skin"){

		$("#cb_title").html("Prop<span style='color: gray; font-size: 80%;'> >> </span>" + name + 	"<div id='cb_close'>&#10006;</div>");
		$("#cb_image").attr("id","skin_" + friendlyName);
		$("#cb_price_breakdown").html("Gold: " + gold + "<br>Price: " + price);
		if((gold-price) < 0){
			$("#cb_balance").html("Needed: " + ((gold - price)*-1)).css("color","gray");	
			$("#cb_buy").html("Close").click(function(){ $("#cb_close").click(); });
		}else{
			
			$("#cb_balance").html("Balance: " + (gold - price)).css("color","#e6e6e6");	

			$("#cb_buy").click(function(){
	
				$.ajax({
					
					type: "GET"
					,url: "/ajax/buy"
					,data: {itemName: name}
					,success: function(info){
						
						console.log(info);
						
						if(info != "e"){
							
							$("#cb_success").show();
							mySkins.push(name);
							storeLoaded = 0; //make sure store reloads to reflect new situation
							
							$("#header_gold").html("Gold x " + info);
							
							console.log("msa" + mySkins);
							
						}
						
					}
					
				});
				
			});


			
		}
		
	}else if(type == "lives"){
		
		
	}
	
	$("#confirm_buy").show();
	$("#mask").show();	

	
	$("#cb_close").click(function(){
		$("#confirm_buy").hide();
		$("#mask").hide();
	});	
	
	
}


function buyGold(gold){
	
	$("#mask").show();
	$("#buy_gold").show();
	
	if(gold == 600){
		
		
		
	}else if(gold == 1400){
		
		
	}else if(gold == 4000){
		
		
		
	}
	
	
	
}

$("#cancel_payment").click(function(){ $("#mask").click(); });






//////////////////////////////////////////////////////////////////////////////////// PLAY PAGE //////////////////////////////////////////////////////////////////////////////////
console.log(Date.now());

//join game button
$("#play_join_button").click(function(){

	//FOR TESTING
	
	//lives = 0;
	//lifeRestock = Date.now() - (1000*60*60*21);
	//boosts = 3;
	//cooldown = cooldown + (1000*60*60*6); //cooldown, you can play again at X time
	
	cooldown = Math.round(cooldown/1000)*1000; //because time conversion is rounding, making it count 2 seconds at a time, then 0 seconds
	lifeRestock = Math.round(lifeRestock/1000)*1000; //because time conversion is rounding, making it count 2 seconds at a time, then 0 seconds
	
	var cooldownTime = cooldown - Date.now(); // time between now and when you're allowed to play again
	
	if(lives == 0){
		
		restockTime = ((86400000) - (Date.now() - lifeRestock)); // 1 day minus how long you've waited since losing 3rd life
		
		console.log("rst " + restockTime);
		
		var cleanTime = msToTime(restockTime);
		
		//$("#jsq_image").css({"left":"","width":"","background-position":""}); //SPRITE eliminated
		$("#jsq_content").html("Next life restock: <br><span id='life_timer' style='font-size: 240%; font-weight: bold;'>" + cleanTime + "</span>");
		
		
		var restockTicker = setInterval(function(){ 
			
			restockTime = ((86400000) - (Date.now() - lifeRestock)); // 1 day minus how long you've waited since losing 3rd life
			var newRestockTime = msToTime(restockTime);
			$("#life_timer").html(newRestockTime);
			if(restockTime < 0) clearInterval(restockTicker);

		},1000);
		
		var setLives = setTimeout(function(){ lives = 3; },restockTime); //set lives back to 3 when restock time is up
		
		
	}else if(cooldownTime >= 0){
		
		var cleanTime = msToTime(cooldownTime);
		//$("#jsq_image").css({"left":"","width":"","background-position":""}); //SPRITE cooldown
		$("#jsq_content").html("Cooldown: <br><span id='cooldown_timer' style='font-size: 240%; font-weight: bold;'>" + cleanTime + "</span>");
		
		var cooldownTicker = setInterval(function(){ 
			
			cooldownTime = cooldown - Date.now(); // how many MS before you're allowed to play again
			var newCooldownTime = msToTime(cooldownTime);
			$("#cooldown_timer").html(newCooldownTime);
			if(cooldownTime < 0) clearInterval(cooldownTicker);
			
			var setCooldown = setTimeout(function(){ cooldown = 0; },cooldownTime); //set lives back to 3 when restock time is up

		},1000);
		
	}else{
		
			$("#boost_count").html(boosts);
		
			if(boosts == 0)
				$("#select_boost").prop("disabled","disabled");
				
	}	
	
	$("#mask").css("display","block");	
	$("#join_game_options").css("display","block");
	
	

});


$("#jsq_play").click(function(){
	
	var boost = ""; //whatever you select... (if they dont use / down own will stay blank)
	var boost = $("#select_boost").val();
	
	
	$.ajax({
		
		type: "GET"
		,url: "/ajax/joinSoloQueue"
		,data: {boost: boost}
		,success: function(info){
			
			var newInfo = info.split("~");
			
			if(newInfo[0] == "in"){
				
				//you are in queue... change status to In Queue...
				$("#friend_list_status").html("<span style='color: yellow;'>In Queue</span>");
				
				//lock to bottom of screen... allow me to cancel, count current wait, estimated wait???
				$("#join_game_options").hide();
				$("#mask").hide();
				
				$("#queue_lobby_footer").html("Queue: <span id='queue_time'></span><div id='cancel_queue'>&#10006;</div>");
				$("#queue_lobby_footer").show();
				
				queueTime = 0;
				
				var queueTicker = setInterval(function(){
					
					queueTime += 1000;
					var newQueueTime = msToTime(queueTime);
					
					$("#queue_time").html(newQueueTime);
					
					//AJAX TO CHECK FOR GAME??
					
				},1000);
				
				
				
			}else if(newInfo[0] == "restock"){ //extra validation catch, can fix later
				
				$("#jsq_content").html("Next life restock: <br><span id='life_timer' style='font-size: 240%; font-weight: bold;'>" + cleanTime + "</span>");
				//next restock...
				var restockTime = msToTime(newInfo[1]);
				
				
				
				
			}else if(newInfo[0] == "cooldown"){ //extra validation catch, can fix later
				
				
				
			}
			
		}
		
	});
	
});


$("#join_group_queue").click(function(){
	
	$.ajax({
		
		type: "GET"
		,url: "/ajax/joinGroupQueue"
		,success: function(info){
			
			
			
			
			
			
			
		}
		
	});
	
	
});



////////////////////////////////////////////////////////////LOBBY SYSTEM //////////////////////////////////////////////////////

$("#create_lobby").click(function(){
	
	
	
	
	
	
});





/////////////////////////////////////////////////////////// QUEUE SYSTEM /////////////////////////////////////////////////////////

//first, keep checking for 9 players

//when 9 players exist, I will be given ACCEPT/ DECLINE prompt

//if I click ACCEPT, then start looking inside QUEUE to see if reserved = 2 (game created), or -1 (someone failed to accept)

function queueChecker(lobbyLeader){
	
	var queue = setInterval(function(){
		
		$.ajax({
			
			type: "GET"
			,url: "/ajax/checkQueue"
			,success: function(info){
				
				
				
			}
			
		});
		
		
		
		
		
		
	},2000);	
	

}











//////////////////////////////////////////////////////////////////////////////////// FOOTER / FRIEND LIST //////////////////////////////////////////////////////////////////////////

$("#footer_friend_button").click(function(){

	var display = $("#friend_list").css("display");
	var friend_display = $("#friend_list_friends").css("display");
	
	
	if(display == "block" && friend_display == "block"){
		$("#friend_list").css("display","none");
	}else if(display == "block" && friend_display == "none"){
		$("#friend_list_alerts").css("display","none");		
		$("#friend_list_groups").css("display","none");
		$("#friend_list_friends").css("display","block");
		$(".footer_button").css("")
		refreshFriendList();
	}else{
		$("#friend_list").css("display","block");	
		$("#friend_list_alerts").css("display","none");	
		$("#friend_list_groups").css("display","none");
		$("#friend_list_friends").css("display","block");
		refreshFriendList();
	}
	
});

$("#footer_groups_button").click(function(){

	var display = $("#friend_list").css("display");
	var groups_display = $("#friend_list_groups").css("display");
	
	if(display == "block" && groups_display == "block"){
		$("#friend_list").css("display","none");
	}else if(display == "block" && groups_display == "none"){
		$("#friend_list_friends").css("display","none");
		$("#friend_list_alerts").css("display","none");
		$("#friend_list_groups").css("display","block");	
		refreshGroupList();
	}else{
		$("#friend_list").css("display","block");	
		$("#friend_list_friends").css("display","none");
		$("#friend_list_alerts").css("display","none");
		$("#friend_list_groups").css("display","block");
		refreshGroupList();		
	}
	
});

$("#footer_alerts_button").click(function(){

	var display = $("#friend_list").css("display");
	var alerts_display = $("#friend_list_alerts").css("display");
	
	if(display == "block" && alerts_display == "block"){
		$("#friend_list").css("display","none");
	}else if(display == "block" && alerts_display == "none"){
		$("#friend_list_friends").css("display","none");
		$("#friend_list_groups").css("display","none");
		$("#friend_list_alerts").css("display","block");
		refreshAlertList();
	}else{
		$("#friend_list").css("display","block");	
		$("#friend_list_friends").css("display","none");
		$("#friend_list_groups").css("display","none");
		$("#friend_list_alerts").css("display","block");
		refreshAlertList();		
	}
	
});


$("#friend_list_minimize").click(function(){

	$("#friend_list").css("display","none");	

});

$("#popup_small_close").click(function(){
	$("#popup_small").css("display","none");
	$("#mask").css("display","none");
});

$("#popup_small_cancel").click(function(){
	$("#popup_small").css("display","none");
	$("#mask").css("display","none");
});

$("#friend_profile_close").click(function(){
	$("#friend_profile").css("display","none");
	$("#mask").css("display","none");
});

function friendListInvite(friend_id,friend){

	var s = $("#friend_list_status").html();
	
	if(s == "Online"){
		$("#mask").css("display","block");
		$("#popup_small").css("display","block");
		$("#popup_small_content").html("Create lobby and invite <u>" + friend + "</u>?<br><span style='font-size: 80%; color: gray'>(You can invite more players from the lobby)</span>");
		$("#popup_small_confirm").html("Create");
		$("#popup_small_cancel").html("Cancel");
		
		$("#popup_small_confirm").click(function(){
			$("#mask").css("display","none");
			$("#popup_small").css("display","none");			
			createLobby(user_id,username,"all","all");
			
		});	
	}else if(s == "In Lobby"){
		invitePlayer(friend);
	}
	
	
}


function friendListProfile(friend_id,friend){

	$("#mask").css("display","block");
	$("#friend_profile").css("display","block");

	//$.ajax({
	//	type: "POST"
	//	,url: "scripts/friend_profile.php"
	//	,data: {friend_id: friend_id}
	//	,success: function(info){
	//		var data = info.split("~");
	//	}
	//});

}

function friendListRemove(friend_id,friend){

		$("#mask").css("display","block");
		$("#popup_small").css("display","block");
		$("#popup_small_content").html("Remove <u>" + friend + "</u> from your friend list?");
		$("#popup_small_confirm").html("Remove");
		$("#popup_small_cancel").html("Cancel");
		
		$("#popup_small_confirm").click(function(){
			
			$.ajax({
				type: "POST"
				,url: "scripts/remove_friend.php"
				,data: {user_id: user_id, friend_id: friend_id}
				,success: function(info){
					$("#mask").css("display","none");
					$("#popup_small").css("display","none");					
					refreshFriendList();
				}
			});

		});	
	
}


function groupListInvite(group_id,group){
	var s = $("#friend_list_status").html();
	
	if(s == "Online"){
		$("#mask").css("display","block");
		$("#popup_small").css("display","block");
		$("#popup_small_content").html("Create lobby and invite <u>" + group + "</u>?<br><span style='font-size: 80%; color: gray'>(You can invite more from the lobby)</span>");
		$("#popup_small_confirm").html("Create");
		$("#popup_small_cancel").html("Cancel");
		
		$("#popup_small_confirm").click(function(){
			$("#mask").css("display","none");
			$("#popup_small").css("display","none");			
			createLobby(user_id,username,"all","all");  //change from invite everyone to invite only the group we clicked on.
			
		});			
	}else if(s == "In Lobby"){
		inviteGroup(group);
	}
}

function groupListProfile(group_id,group){
	$("#mask").css("display","block");
	$("#friend_profile").css("display","block");

	//MODIFY WHAT IS IN THE WINDOW
	
	//$.ajax({
	//	type: "POST"
	//	,url: "scripts/friend_profile.php"
	//	,data: {friend_id: friend_id}
	//	,success: function(info){
	//		var data = info.split("~");
	//	}
	//});
}

function groupListRemove(group_id,group){
	$("#mask").css("display","block");
	$("#popup_small").css("display","block");
	$("#popup_small_content").html("Leave group <u>" + group + "</u>?");
	$("#popup_small_confirm").html("Leave");
	$("#popup_small_cancel").html("Cancel");
	
	$("#popup_small_confirm").click(function(){
		
		$.ajax({
			type: "POST"
			,url: "scripts/leave_group.php"
			,data: {user_id: user_id, username: username, group_id: group_id}
			,success: function(info){
				$("#mask").css("display","none");
				$("#popup_small").css("display","none");					
				refreshGroupList();
			}
		});

	});	
}




function refreshFriendList(){

	$.ajax({
		type: "POST"
		,url: "scripts/display_friends.php"
		//,data: {user_id: user_id}
		,success: function(info){
			$("#friend_boxes").html(info);
			
			//GIVE JSON [{username: "friend1",status: "Online"},{username: "friend2",status: "In Game"}]

			//RESIZE FONT FOR LONG USERNAMES			
			$(".friend_box_username_wrapper").each(function(){
				var w = $(this).width();
				var c = $(this).children();
				var u = c.width();
			
				if(u > w){
					var perc = u/w;
					var r = 1/perc;
					var rawfont = $(this).css("font-size");
					var font = parseInt(rawfont.replace("px",""));
					var newFont = Math.round(font * r);
					$(this).css("font-size",newFont);
				}
				
			});
			
			$(".friend_box").hover(
				function(){
					$(this).children(".friend_option_invite").css({"background":"#1a6666","color":"#e6e6e6","border":"1px solid black"});
					$(this).children(".friend_option_profile").css({"background":"#00805f","color":"#e6e6e6","border":"1px solid black"});
					$(this).children(".friend_option_remove").css({"background":"#800000","color":"#e6e6e6","border":"1px solid black"});
					$(this).children(".friend_option_remove_pending").css({"background":"#800000","color":"#e6e6e6","border":"1px solid black"});
					$(this).children(".friend_option_profile_offline").css({"background":"#00805f","color":"#e6e6e6","border":"1px solid black"});
					$(this).children(".friend_option_remove_offline").css({"background":"#800000","color":"#e6e6e6","border":"1px solid black"});
				},function(){
					$(this).children(".friend_option_invite").css({"background":"#003326","color":"gray","border":"1px solid #001a13"});
					$(this).children(".friend_option_profile").css({"background":"#003326","color":"gray","border":"1px solid #001a13"});
					$(this).children(".friend_option_remove").css({"background":"#003326","color":"gray","border":"1px solid #001a13"});
					$(this).children(".friend_option_remove_pending").css({"background":"#003326","color":"gray","border":"1px solid #001a13"});
					$(this).children(".friend_option_profile_offline").css({"background":"#003326","color":"gray","border":"1px solid #001a13"});
					$(this).children(".friend_option_remove_offline").css({"background":"#003326","color":"gray","border":"1px solid #001a13"});				
			});
			
		}
	});
}

function refreshGroupList(){

	$.ajax({
		type: "POST"
		,url: "scripts/display_groups.php"
		//,data: {user_id: user_id}
		,success: function(info){
			
			
			
			$("#group_boxes").html(info);
			
			$(".group_box_username_wrapper").each(function(){
				var w = $(this).width();
				var c = $(this).children();
				var u = c.width();
			
				if(u > w){
					var perc = u/w;
					var r = 1/perc;
					var rawfont = $(this).css("font-size");
					var font = parseInt(rawfont.replace("px",""));
					var newFont = Math.round(font * r);
					$(this).css("font-size",newFont);
				}
				
			});
			
			$(".group_box").hover(
			function(){
				$(this).children(".group_option_invite").css({"background":"#1a6666","color":"#e6e6e6","border":"1px solid black"});
				$(this).children(".group_option_profile").css({"background":"#00805f","color":"#e6e6e6","border":"1px solid black"});
				$(this).children(".group_option_remove").css({"background":"#800000","color":"#e6e6e6","border":"1px solid black"});
			},function(){
				$(this).children(".group_option_invite").css({"background":"#003326","color":"gray","border":"1px solid #001a13"});
				$(this).children(".group_option_profile").css({"background":"#003326","color":"gray","border":"1px solid #001a13"});
				$(this).children(".group_option_remove").css({"background":"#003326","color":"gray","border":"1px solid #001a13"});		
			});			
			
			
			
		}
	});

	

}

function refreshAlertList(){
	
	$.ajax({
		type: "GET"
		,url: "/ajax/alerts"
		,success: function(info){

			//loop through the alerts, check them and display them.
	
		}
		
	});
	
}

function acceptFriend(friend_id){
	
	
	$.ajax({
		type: "POST"
		,url: "scripts/alert_option_select.php"
		,data: {user_id: user_id, username: username, id: friend_id, type: "friend", selection: "accept"}
		,success: function(info){
			refreshAlertList();
		}
	
	});
	
}

function declineFriend(friend_id){
	
}

function acceptLobbyInvite(lobby_id){
	
}

function declineLobbyInvite(lobby_id){
	
}

$("#show_join_group").click(function(){
	$("#join_group").slideDown(100);
});

$("#show_create_group").click(function(){
	$("#create_group").slideDown(100);
});

$("#join_group_button").click(function(){
	
	$.ajax({
		type: "POST"
		,url: "scripts/join_group.php"
		,data:{user_id: user_id, username: username, gn:gn, gp: gp}
		,success: function(info){
			if(info == "good"){
				refreshGroupList();
			}else{
				$("#join_group_response").html("<span style='color: #cc0000;'>" + info + "<span id='join_group_response_close'> [X]</span></span>");
				$("#join_group_response_close").click(function(){$("#join_group_response").css("display","none");});	
			}
		}
	
	});

});

$("#join_group_close").click(function(){
	//$("#join_group").css("display","none");
	$("#join_group").css("display","none");
});

$("#create_group_button").click(function(){

	var gn = $("#create_group_name").val();
	var gp = $("#create_group_password").val();
	var gp2 = $("#create_group_password2").val();
	
	if(gn.length >= 3 && gn.length <= 20){
	
		var s = gn.search(/fuck|cunt|shit|cock|nigger|spic|wetback|bitch|blowjob|chink|fag|kike|niglet|nigga|rimjob|retard|twat|whore/i);
		if(s == -1){
		
			if(gp.length >= 3 && gp.length <= 20){
			
				if(gp == gp2){
				
					$.ajax({
						type: "POST"
						,url: "scripts/create_group.php"
						,data: {user_id: user_id, username: username, gn: gn, gp: gp, gp2: gp2}
						,success: function(info){
							if(info == "good"){
								$("#create_group_response").html("<span style='color: green;'>Group created!<span id='create_group_response_close'> [X]</span></span>");
								$("#create_group_response_close").click(function(){$("#create_group_response").css("display","none");});
								$("#create_group_name").val("");
								$("#create_group_password").val("");
								$("#create_group_password2").val("");
								refreshGroupList();
							}else if(info == "taken"){
								$("#create_group_response").html("<span style='color: #cc0000;'>This group name is taken<span id='create_group_response_close'> [X]</span></span>");
								$("#create_group_response_close").click(function(){$("#create_group_response").css("display","none");});									
							}else if(info == "toolong"){
								$("#create_group_response").html("<span style='color: #cc0000;'>Group name: (3-20 characters)<span id='create_group_response_close'> [X]</span></span>");
								$("#create_group_response_close").click(function(){$("#create_group_response").css("display","none");});
							}else if(info == "badwords"){
								$("#create_group_response").html("<span style='color: #cc0000;'>No bad words!<span id='create_group_response_close'> [X]</span></span>");
								$("#create_group_response_close").click(function(){$("#create_group_response").css("display","none");});									
							}else if(info == "onemax"){
								$("#create_group_response").html("<span style='color: #cc0000;'>You may only own one group<span id='create_group_response_close'> [X]</span></span>");
								$("#create_group_response_close").click(function(){$("#create_group_response").css("display","none");});									
							}
						}
						
					});
				
				}else{
					$("#create_group_response").html("<span style='color: #cc0000;'>Your passwords must match<span id='create_group_response_close'> [X]</span></span>");
					$("#create_group_response_close").click(function(){$("#create_group_response").css("display","none");});				
				}
			}else{
				$("#create_group_response").html("<span style='color: #cc0000;'>Password: (3-20 characters)<span id='create_group_response_close'> [X]</span></span>");
				$("#create_group_response_close").click(function(){$("#create_group_response").css("display","none");});
			}			

		}else{
			$("#create_group_response").html("<span style='color: #cc0000;'>No bad words!<span id='create_group_response_close'> [X]</span></span>");
			$("#create_group_response_close").click(function(){$("#create_group_response").css("display","none");});		
		}	

	}else{
		$("#create_group_response").html("<span style='color: #cc0000;'>Group name: (3-20 characters)<span id='create_group_response_close'> [X]</span></span>");
		$("#create_group_response_close").click(function(){$("#create_group_response").css("display","none");});
	}
});

$("#create_group_close").click(function(){
	$("#create_group").css("display","none");
});




$("#add_friend_input").keyup(function(event){
    if(event.keyCode == 13){
        $("#add_friend_button").click();
    }
});



$("#add_friend_button").click(function(){

	var friend = $("#add_friend_input").val();
	$("#add_friend_input").val("");
	
	$.ajax({
		type: "POST"
		,url: "scripts/add_friend.php"
		,data: {user_id: user_id, username: username, friend: friend}
		,success: function(info){
			$("#add_friend_response").html(info);
			$("#add_friend_response").slideDown(100);
			$("#add_friend_response_close").click(function(){
				$("#add_friend_response").css("display","none");
			});
			refreshFriendList();
		}
	});

}); 



function createLobby(user_id,username,friends,groups){
	alert(user_id + " " + username + " " + friends + " " + groups);
}


function invitePlayer(player){

	alert(player);

}


function inviteGroup(group){
	alert(group);
}


function timerIncrement(){
	idleTime++;
	if (idleTime > 5) { //set to away if gone for 5 mins
		
		var s = $("#friend_list_status").html();
		if(s == "Online"){
		
			updateStatus("Away");
			//bind one-time event so if away and come back, set back to online
			$(document).one("mousemove",function(){
				updateStatus("Online");
				refreshFriendList();
			});		
		}
		
	}
	
	if(idleTime > 30){
		//minimize friend_list
		$("#friend_list").css("display","none");
	}
	
} 

function friendUpdater(){

	//if friends are open, refresh them every 5 seconds.
	var friends = $("#friend_list").css("display");
	if(friends == "block"){
	
		var f = $("#friend_list_friends").css("display");
		var g = $("#friend_list_groups").css("display");
		var a = $("#friend_list_alerts").css("display");
		
		if(f == "block"){
			var h = $('.friend_box:hover').length;
			if(h == 0){
				refreshFriendList();
			}	
		}else if(g == "block"){
			var gh = $('.group_box:hover').length;
			if(gh == 0){
				//refreshGroupList();
			}		
		}
		
	}
	
	refreshAlertList();

}

function updateStatus(type){

	$.ajax({
		type: "POST"
		,url: "scripts/update_status.php"
		,data: {user_id: user_id, type: type}
		,success: function(info){
			$("#friend_list_status").html(type);
			if(type == "Away"){$("#friend_list_status").css("color","#cc0000");}
			else if(type == "Online" || type == "In Lobby"){$("#friend_list_status").css("color","green");}
			else if(type == "In Game"){$("#friend_list_status").css("color","orange");}
		}
	});
	
}

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}


$(document).ready(function(){
	

	//load friends
	//refreshFriendList();
    
	//resize font on friend list header
	var w = $("#friend_list_username_wrapper").width();
	var u = $("#friend_list_username").width();
	
	if(u > w){
		var perc = u/w;
		var r = 1/perc;
		var rawfont = $("#friend_list_username_wrapper").css("font-size");
		var font = parseInt(rawfont.replace("px",""));
		var newFont = Math.round(font * r);
		$("#friend_list_username").css("font-size",newFont);
		$("#header_username").css("font-size",newFont);
	}
		

   //var idleInterval = setInterval(timerIncrement, 60000); // 60000 1 minute
   //var updateFriends = setInterval(friendUpdater, 5000); // 5 seconds

    //Zero the idle timer on mouse movement.
    $(this).mousemove(function (e) {
		idleTime = 0;
    });
    $(this).keypress(function (e) {
		idleTime = 0;
    }); 
	
});


var myEvent = window.attachEvent || window.addEventListener;
var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload';

	myEvent(chkevent, function(e) {
		if(e || window.event){
			
			//update mystatus to Offline...
			
		};
		
	});	





