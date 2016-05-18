/*

var cluster = require("cluster");

if(cluster.isMaster){
	
	var numCPUs = require("os").cpus().length;
	
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
	
	cluster.on("exit",function(){
			cluster.fork();
	});
	
	
	
}else{
	//require("./server");
	//else run http server???
	
}

*/

//USE NGINX TO CREATE MULTIPLE SOCKET "NODES" AND ROUTE REQUESTS BETWEEN THEM
//SPLIT UP GAMESTATE OBJECT INTO 4? or 7?  (ASSUMING 8 CORE SERVER)
//HANDLE EACH GAMESTATE COLLECTION SEPARATELY BY A CPU CORE...