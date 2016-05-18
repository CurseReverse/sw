$("#login_button").click(function(){
	
	var username = $("#login_username").val();
	var password = $("#login_password").val();
	
	
	$.ajax({
		type: "GET"
		,url: "/ajax/login"
		,data: {username: username, password: password}
		,success: function(info){
			if(info == 0){
				//bad login message here
				$("#login_response").html("Username / Password mismatch");
			}else{
				window.location = info;
			}
		}
	});
	
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$("#signup").click(function(){
	$("#su_form").show();
	$("#mask").show();
});

$("#mask").click(function(){
	$("#su_form").hide();
	$("#mask").hide();
});

$("#su_button").click(function(){
	signUp();
});


$("#su_password").click(function(){
	//validate username in javascript, then php after
	var username = $("#su_username").val();
	var lettersnumbers = /^[0-9a-zA-Z]+$/;
	
	if(username.match(lettersnumbers) && username.length > 2 && username.length < 17){
		$.ajax({
			type: "GET"
			,url: "/ajax/signup_checker"
			,data: {username: username}
			,success: function(info){
				if(info == "taken"){
					$("#su_username_response").css("color","red");
					$("#su_username_response").html("This username is taken");					
				}else{
					$("#su_username_response").css("color","green");
					$("#su_username_response").html("Good");				
				}
			}
		});
	}else{
	
		$("#su_username_response").css("color","red");
		$("#su_username_response").html("Username must be letters and numbers, and between 3-16 characters");
	
	}
	
	
});


$("#su_email").click(function(){

	var password = $("#su_password").val();
	var password2 = $("#su_password2").val();	
	
	if(password == password2 && password.length > 6 && password.length <= 20){
		$("#su_password_response").css("color","green");
		$("#su_password_response").html("Good");
		$("#su_password2_response").css("color","green");
		$("#su_password2_response").html("Good");
	}else{
		$("#su_password_response").css("color","red");
		$("#su_password_response").html("Passwords must match, and be between 7-20 characters");
		$("#su_password2_response").css("color","red");
		$("#su_password2_response").html("Passwords must match, and be between 7-20 characters");	
	}
});


$("#su_email").keyup(function(event){
    if(event.keyCode == 13){
        $("#su_button").click();
    }
});

function signUp(){
	
	var username = $("#su_username").val();
	var password = $("#su_password").val();
	var password2 = $("#su_password2").val();
	var email = $("#su_email").val();
	
	//alert(username + password + password2 + email);
	
	var lettersnumbers = /^[0-9a-zA-Z]+$/;
	
	//$("#signUpResponse").html(username.match(letters));
	
	//validate form
	if(username.match(lettersnumbers) && username.length > 2 && username.length < 17 && password == password2 && password.length > 6 && password.length < 20 && email.indexOf("@") > -1 && email.indexOf(".") > -1){
	
		$.ajax({
			type: "GET"
			,url: "/ajax/signup"
			,data: {username: username, password: password, password2: password2, email: email}
			,success: function(info){
				//script returns, "username_taken","email_taken","password_unmatch","bad_password","account_created"
				
				if(info == "username_taken"){
					$("#su_username_response").css("color","red");
					$("#su_username_response").html("This username is taken");
				}else if(info == "email_taken"){
					$("#su_email_response").css("color","red");
					$("#su_email_response").html("This email is used already");					
				}else if(info == "both_taken"){
					$("#su_username_response").css("color","red");
					$("#su_username_response").html("This username is taken");		
					$("#su_email_response").css("color","red");
					$("#su_email_response").html("This email is used already");
				}else if(info == "password_unmatch"){
					$("#su_password_response").css("color","red");
					$("#su_password_response").html("Passwords must be matching");
					$("#su_password2_response").css("color","red");
					$("#su_password2_response").html("Passwords must be matching");	
				}else if(info == "bad_password"){
					$("#su_password_response").css("color","red");
					$("#su_password_response").html("Your password must be between 7-20 characters");
					$("#su_password2_response").css("color","red");
					$("#su_password2_response").html("Your password must be between 7-20 characters");	
				}else if(info == "account_created"){
					$("#su_username_response").css("color","green");
					$("#su_username_response").html("Good");
					$("#su_password_response").css("color","green");
					$("#su_password_response").html("Good");
					$("#su_password2_response").css("color","green");
					$("#su_password2_response").html("Good");
					$("#su_email_response").css("color","green");
					$("#su_email_response").html("Good");					
					$("#su_response").css("color","green");
					$("#su_response").html("<br>An email has been sent to you, please follow the link inside to activate your account.");
				}
			}	
			
		});
		
		
	}else{
	
		if(username.match(lettersnumbers)){
		}else{
			$("#su_username_response").css("color","red");
			$("#su_username_response").html("Letters and numbers only");
		}
		
		if(username.length < 3 || username.length > 16){
			$("#su_username_response").css("color","red");
			$("#su_username_response").html("Must be between 3-16 characters");			
		}
		
		if(username.length > 2 && username.length < 17 && username.match(lettersnumbers)){
			$("#su_username_response").css("color","green");
			$("#su_username_response").html("Good");					
		}
		
		if(password != password2){
			$("#su_password_response").css("color","red");
			$("#su_password_response").html("Passwords do not match");
			$("#su_password2_response").css("color","red");
			$("#su_password2_response").html("Passwords do not match");			
		}
		
		if(password.length < 4 || password.length > 20){
			$("#su_password_response").css("color","red");
			$("#su_password_response").html("Must be between 4-16 characters");			
		}
		
		if(password2.length < 4 || password2.length > 20){
			$("#su_password2_response").css("color","red");
			$("#su_password2_response").html("Must be between 4-16 characters");			
		}
		
		if(password == password2 && password.length > 3 && password.length <= 20){
			$("#su_password_response").css("color","green");
			$("#su_password_response").html("Good");	
			$("#su_password2_response").css("color","green");
			$("#su_password2_response").html("Good");			
		}
		
		if(email.indexOf("@") == -1 || email.indexOf(".") == -1){
			$("#su_email_response").css("color","red");
			$("#su_email_response").html("Invalid Email");			
		}else{
			$("#su_email_response").css("color","green");
			$("#su_email_response").html("Good");		
		}
		
	
	}
	
	
}
