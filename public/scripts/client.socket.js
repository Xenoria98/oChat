var client_socket = io().connect();
var PING = null;
var receiveData = null;

// SEND TYPES -> toServer(dat)
// sendToSender
// sendToAll
// sendToAllExceptSender
// sendToClient [client-id]
// sendToAllInRoom [room-name]
// sendToAllInRoomExceptSender

var SENDTYPES = {
	SENDER: "SENDER",
	ALL: "ALL",
	ALLEXCEPTSENDER: "ALLEXCEPTSENDER",
	CLIENT: "CLIENT",
	ALLINROOM: "ALLINROOM",
	ALLINROOMEXCEPTSENDER: "ALLINROOMEXCEPTSENDER"
}

var sendData = {
	'sendType': null,
	'sendTo' : {
		'id': null,
		'obj': {}
	},
	'receiveTo': {
		'obj': {}
	}
}

function TOSERVER(dat){
	client_socket.emit("toServer", dat);
}

client_socket.on("toClient", function(dat){
	receiveData = dat;
	if(PING != null)PING(dat);
});

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

function NAMEVALIDATION(name){
	let invalidChar = "+_)(*&^%$#@!~`=-|}{:?><\][';/.,";
	let isValid = true;

	for (let i = 0; i < invalidChar.length; i++) {
        if(name.includes(invalidChar[i]) == true){
            isValid = false;
            break;
        }
    }

    return isValid;
}

function UUIDV4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

