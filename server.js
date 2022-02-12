const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

var SERVER_DATA = {
	CLIENTS: {},
	PUBLIC: {}
}

io.on('connection', function(socket){

	//CREATE CLIENT DATA ON CONNECTION 
	SERVER_DATA.CLIENTS[socket.id] = new Object();

	socket.on('disconnect', function(){
		//DELETE CLIENT DATA WHEN DISCONNECT
		delete SERVER_DATA.CLIENTS[socket.id];

		SENDTYPES.ALL({
			"get_data":{
				num_of_clients: Object.keys(SERVER_DATA.CLIENTS).length
			}
		});

	});


	socket.on('toServer', function(dat){

		if(dat['sendType'] != undefined){

			//JOIN OR LEAVE ROOM
			if(dat['sendTo']['join_room'] != undefined)joinRoom(dat['sendTo']['join_room'], socket);
			if(dat['sendTo']['leave_room'] != undefined)leaveRoom(dat['sendTo']['leave_room'], socket);

			//INSERT CLIENT DATA
			if(dat['sendTo']['insert'] != undefined){

				//INSERT PUBLIC DATA
				if(dat['sendTo']['insert']['existKey'] != undefined){

					let existKey = dat['sendTo']['insert']['existKey'];
					if(existKey == "PUBLIC"){
						let insertKey = dat['sendTo']['insert']['key'];
						let insertKeyVal = dat['sendTo']['insert']['val'];
						SERVER_DATA["PUBLIC"][insertKey] = insertKeyVal;
					}
				}
				//INSERT PRIVATE DATA
				else if(SERVER_DATA["CLIENTS"][socket.id] != undefined){
					let insertKey = dat['sendTo']['insert']['key'];
					let insertKeyVal = dat['sendTo']['insert']['val'];
					SERVER_DATA["CLIENTS"][socket.id][insertKey] = insertKeyVal;
				}
			}

			//GET SERVER DATA
			if(dat['sendTo']['get_data'] != undefined){
				dat['receiveTo']['get_data'] = {
					num_of_clients: Object.keys(SERVER_DATA.CLIENTS).length,
					PUBLIC: SERVER_DATA.PUBLIC,
					PRIVATE: SERVER_DATA["CLIENTS"][socket.id]
				}
			}

			if(dat['receiveTo'] != undefined){
				dat['receiveTo']['senderName'] = SERVER_DATA.CLIENTS[socket.id].name || "Anonymous";

					 //SENDING DATA
					 if(dat['sendType'] == 'SENDER')                 SENDTYPES.SENDER(dat['receiveTo'], socket);
				else if(dat['sendType'] == 'ALL')             	     SENDTYPES.ALL(dat['receiveTo']);
				else if(dat['sendType'] == 'ALLEXCEPTSENDER') 	     SENDTYPES.ALLEXCEPTSENDER(dat['receiveTo'], socket);
				else if(dat['sendType'] == 'CLIENT')          	     SENDTYPES.CLIENT(dat['receiveTo'], dat['sendTo']['listener'], socket);
				else if(dat['sendType'] == 'ALLINROOMEXCEPTSENDER')  SENDTYPES.ALLINROOMEXCEPTSENDER(dat['receiveTo'], dat['sendTo']['listener'], socket);
				else if(dat['sendType'] == 'ALLINROOM')			     SENDTYPES.ALLINROOM(dat['receiveTo'], dat['sendTo']['listener']);
			}

		}
		else{

			//GET DATA FROM ADMIN
			if(dat['admin_data'] != undefined){
				console.table(SERVER_DATA);
				//SENDTYPES.SENDER(SERVER_DATA, socket);
			}
		}

	});

});

//SEND TYPES
var SENDTYPES = {}

SENDTYPES.ALL = function(obj){
	io.sockets.emit("toClient", obj);
}

SENDTYPES.SENDER = function(obj, socketSender){
	socketSender.emit('toClient', obj);
}

SENDTYPES.ALLEXCEPTSENDER = function(obj, socketSender){
	socketSender.broadcast.emit("toClient", obj);
}

SENDTYPES.CLIENT = function(obj, socketReceiverID, socketSender){
	socketSender.broadcast.to(socketReceiverID).emit("toClient", obj);
}

SENDTYPES.ALLINROOM = function(obj, roomName){
	io.to(roomName).emit("toClient", obj);
}

SENDTYPES.ALLINROOMEXCEPTSENDER = function(obj, roomName, socketSender){
	socketSender.to(roomName).emit("toClient", obj);
}

//ROOM
function joinRoom(roomName, socketSender){
	socketSender.join(roomName);
}

function leaveRoom(roomName, socketSender){
	socketSender.leave(roomName);
}

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

http.listen(port, function(){
  console.log('listening on *:8080');
});

