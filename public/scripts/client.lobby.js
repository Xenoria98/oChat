
//LISTENER CAN BE A SOCKET ID OR A ROOM

var user = {
	name: null,
	id: null,
	room: {
		id: 'lobby-gl',
		name: "Anonymous"
	}
}

var apps = [
	{
		name: "Pin' Pon'",
		description: "", 
		url: "", 
		max: 2
	},
	{
		name: "Space Battle",
		description: "", 
		url: "", 
		max: 2
	}
]

var rooms = [];
var users = [];
var roomLobbyMin = true;
var clicked_room_id = null;
var chat_data = null; 

client_socket.on('connect', function(){
	user.id = client_socket.id;

	$(apps).each(function(i){
		$("#select-app").append("<option value='"+i+"'>"+apps[i].name+"</option>");
	})

	$('.user-enter-name').on('click', function(){
		$('.user-input-name').hide();
		$('.room-lobby-panel').show();

		user.name = $('.user-text-name').val();

		TOSERVER({
			'sendType': SENDTYPES.ALL,
			'sendTo' : {
		 		'join_room': 'lobby-gl',
		 		'insert': {
		 			'key': 'name',
		 			'val': user.name
		 		},
		 		'get_data': 0
		 	},
			'receiveTo': {}
		})

		chat_data.chat.name = user.name;
	})


	$('.start-create-room-btn > div').on('click', function(){
		$(".room-create-panel").fadeIn();
	})

	$('.cancel-create-room-btn > div').on('click', function(){
		$(".room-create-panel").hide();
	})

	$('.create-room-btn > div').on('click', function(){
		var roomname = $("#input-room-name").val();
		var validRoomname = NAMEVALIDATION(roomname);

        if(validRoomname == false){
        	let invalidChar = "+_)(*&^%$#@!~`=-|}{:?><\][';/.,";
        	alert("Roomname cannot contain these characters "+invalidChar);
        }
        else if(parseInt($("#select-app").val()) == -1){
        	alert("Please select an app to create room");
        }
		else if(roomname != "" && roomname != "lobby-gl" && validRoomname == true){

			var room = {
				uiid: UUIDV4(),
				name: roomname,
			}

			TOSERVER({
				'sendType': SENDTYPES.ALLINROOMEXCEPTSENDER,
				'sendTo' : {
				 	'listener': user.room.id,
				 	'join_room': room.uiid,
				 	'leave_room': user.room.id,
				 	'insert': {
				 		'existKey': 'PUBLIC',
				 		'key': room.uiid,
				 		'val': {
				 			'name': room.name,
				 			'app': apps[parseInt($("#select-app").val())],
				 			'user_num': 1
				 		}
				 	}
				 },
				'receiveTo': {
					'add_room': room
				}
			});

			user.room.id = room.uiid;
			user.room.name = room.name;
			$(".room-create-panel").hide();
		}
		else{
			alert("Input room name!");
		}
	})
});

$(".chat-panel > iframe").on("load", function(){
	this.contentWindow.chat.headClick = function(isOpenChat){

		if(isOpenChat == true){
			$(".chat-panel").css("height", "calc(100% - 100px)");
		}
		else{
			$(".chat-panel").css("height", "50px");
		}
	}

	this.contentWindow.chat.getMessage = function(msg){
		TOSERVER({
			'sendType': SENDTYPES.ALLINROOMEXCEPTSENDER,
			'sendTo' : {
		 		'listener': user.room.id
		 	},
			'receiveTo': {
				'chat_msg': msg
			}
		})
	}

	chat_data = this.contentWindow;
});

PING = function(dat){

	if(dat['get_data'] != undefined) updateLobby(dat['get_data'])
	if(dat['chat_msg'] != undefined) chat_data.chatUpdate({name: dat['senderName'], msg: dat['chat_msg']});
	
}

function updateLobby(dat){
	if(dat['num_of_clients'] != undefined) $("#player-num").html(dat["num_of_clients"]);
}

function ROOMUPDATE(dat){

	function ADDSLOT(name, roomID){

		var newSlot = 	'<div class="room-box" id="'+roomID+'">'+
							'<div>'+
								'<div class="room-name">'+name+'</div>'+
								'<div class="room-count"></div>'+
							'</div>'+
						'</div>';	
		$('.rooms-list-body').append(newSlot);

		$("#"+roomID+" > div").on('click', function(){
			if(clicked_room_id != null)clicked_room_id.removeClass("room-clicked");
			clicked_room_id = $(this);
			clicked_room_id.addClass("room-clicked");
		})
	}

	if(Array.isArray(dat) == true){
		$('.rooms-list-body').children().remove();
		
		$(dat).each(function(i){
			rooms.push(dat[i]);		
		})

		$(rooms).each(function(i){
			ADDSLOT(rooms[i].name, rooms[i].id);
		})
	}
	else{
		if(typeof dat == 'object'){
			rooms.push(dat);
			ADDSLOT(dat.name, dat.id);
		}
		else if(typeof dat == 'string'){
			var index = findWithAttr(rooms, 'name', dat);
			$('#'+dat).remove();
			rooms.splice(index, 1);
		}
	}
}

function JOINROOM(newroomid, newroomname){

	TOSERVER({
		'sendType': SENDTYPES.ALLINROOMEXCEPTSENDER,
		'sendTo' : {
			'listener': user.room.id,
			'join_room': newroomid,
			'leave_room': user.room.id
		},
		'receiveTo': {
		
		}
	});

	user.room.id = room.uiid;
	user.room.name = newroomname;
}



