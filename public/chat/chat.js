		var chat = {
			name: "Anonymous",
			message: "Lorem ipsum",
			image: null,
			isselfchat: true,
			getMessage: null,
			unseen_chat_count: 0,
			headClick: null,
			heading: null
		}

		var emojiLoaded = false;
		var showEmojiPanel = false;
		var openChat = false;

		document.addEventListener("DOMContentLoaded", (event) => {

			chat.heading = function(name){
				document.querySelector(".chat-heading").innerHTML = name;
			}

			document.querySelector("#input-chat").value = "";

		    document.querySelector("#btn-chat-lobby").addEventListener("click", function(){

				var msg = document.querySelector("#input-chat").value;
				msg = removeStartSpace(msg);
				msg = removeEndSpace(msg);

				if(msg == "" || msg == " "){
					document.querySelector("#input-chat").value = "";
					return;
				}

				chat.message = msg;
				chatUpdate({name: chat.name, msg: chat.message }, chat.isselfchat);
				document.querySelector("#input-chat").value = "";
				

				if(chat.getMessage != null)chat.getMessage(chat.message);

				showEmojiPanel = false;
				document.querySelector(".emoji-panel").style.display = "none";
			});

			document.querySelector("#btn-emoji-lobby").addEventListener("click", function(){

				if(emojiLoaded == false){
					for (var i = 0; i < 250; i++) {
						document.querySelector(".emoji-panel > div").innerHTML += "<span class='emoji' loading='lazy'><span onclick='addEmoji(this)'>"+emojis[i]+"</span></span>";
					}
					emojiLoaded = true;
				}

				if(showEmojiPanel == false){
					document.querySelector(".emoji-panel").style.display = "block";
				}
				else{ document.querySelector(".emoji-panel").style.display = "none"; }

				showEmojiPanel = !showEmojiPanel;
			});

			// document.querySelector(".chat-head").addEventListener("click", function(){
			// 	if(openChat == true){
			// 		document.querySelector("html").style.height = "100%";
			// 		chat.unseen_chat_count = 0;
			// 		document.querySelector(".unseen_chat_count").style.display = "none";
			// 		document.querySelector(".unseen_chat_count > div").innerHTML = chat.unseen_chat_count;
			// 		document.querySelector(".chat-foot").style.display = "flex";

			// 		if(chat.headClick != null)chat.headClick(true)
			// 	}
			// 	else{
			// 		document.querySelector("html").style.height = "50px";
			// 		document.querySelector(".chat-foot").style.display = "none";
			// 		if(chat.headClick != null)chat.headClick(false);
			// 	}
			// 	openChat = !openChat;
			// });

			
		});

		function addEmoji(ctx){
			insertAtCaret(document.querySelector("#input-chat"), ctx.innerHTML);
		}

		function chatUpdate(dat, isSelfChat = false){

			if(isSelfChat == false && openChat == true){
				document.querySelector(".unseen_chat_count").style.display = "block";
				chat.unseen_chat_count++;

				let displayCount = null;

				if(chat.unseen_chat_count >= 99){
					displayCount = "99+";
				}
				else{
					displayCount = chat.unseen_chat_count;
				}

				document.querySelector(".unseen_chat_count > div").innerHTML = displayCount;
			}

			var domElem = document.createElement("div");
			domElem.setAttribute("class", "chat-body-box"+ (isSelfChat ? " right-chat" : ""));

			var domString =	'<div>'+
								'<div class="chat-user-name">'+dat.name+'</div>'+
								'<div class="chat-user-msg"><div>'+dat.msg+'</div></div>'+
							'</div>';
							
			domElem.innerHTML = domString;				
			var chatBox = document.querySelector(".chat-panel .chat-body > div:nth-child(1)");				
			chatBox.append(domElem);
			var boxes = document.querySelector(".chat-panel .chat-body > div:nth-child(1)").children;

			if(openChat == false){
				if(boxes[boxes.length - 1].scrollIntoViewIfNeeded == undefined){
					boxes[boxes.length - 1].scrollIntoView();
				}
				else{ boxes[boxes.length - 1].scrollIntoViewIfNeeded();}
			}
		}

		function removeStartSpace(txt){
			var copyTxt = txt;
			var countSpace = 0;
			var i = 0;
			do{
				if(txt.charAt(i) == "\n"){countSpace++; }
				i++;
			}while(txt.charAt(i) == "\n")

			for (var j = 0; j < countSpace; j++) {copyTxt = copyTxt.replace("\n", ""); }

			return copyTxt;
		}

		function removeEndSpace(txt){
			var copyTxt = "";
			var countSpace = 0;
			for (var i = txt.length - 1; i > 0; i--) {
				if(txt.charAt(i) == "\n")countSpace++;
				else{break;}
			}
			for (var i = 0; i < txt.length - countSpace; i++) {copyTxt += txt.charAt(i); }
			return copyTxt;
		}

		function insertAtCaret(areaId, text) {
		  var txtarea = areaId;
		  if (!txtarea) {
		    return;
		  }

		  var scrollPos = txtarea.scrollTop;
		  var strPos = 0;
		  var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
		    "ff" : (document.selection ? "ie" : false));
		  if (br == "ie") {
		    txtarea.focus();
		    var range = document.selection.createRange();
		    range.moveStart('character', -txtarea.value.length);
		    strPos = range.text.length;
		  } else if (br == "ff") {
		    strPos = txtarea.selectionStart;
		  }

		  var front = (txtarea.value).substring(0, strPos);
		  var back = (txtarea.value).substring(strPos, txtarea.value.length);
		  txtarea.value = front + text + back;
		  strPos = strPos + text.length;
		  if (br == "ie") {
		    txtarea.focus();
		    var ieRange = document.selection.createRange();
		    ieRange.moveStart('character', -txtarea.value.length);
		    ieRange.moveStart('character', strPos);
		    ieRange.moveEnd('character', 0);
		    ieRange.select();
		  } else if (br == "ff") {
		    txtarea.selectionStart = strPos;
		    txtarea.selectionEnd = strPos;
		    txtarea.focus();
		  }

		  txtarea.scrollTop = scrollPos;
		}