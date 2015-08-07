// connections websocket avec le serveur Python
function init_ws() {
    if (broadcast == 0) {
        ws = new WebSocket("ws://" + localIP + ":8001/");
        // Socket for the local communications
		ws.onmessage = function(d) {
            var datas = d.data;
            if (datas != "wait") {
                wait = 0;
                update_datas(datas);
            } else
                wait = 1
        };
		ws.onclose = function() {
            setTimeout(function () {location.reload()},1000)
            ws.close();
        };
		window.onbeforeunload = function() {
			ws.onclose = function () {}; // disable onclose handler first
			ws.close()
		};
        ws.onopen = function () {
            ws.send("send_statics");    // we want to collect the statics datas (name, num, ir)
            // We define the refresh rate for the datas
            local_tick = 0
            setTimeout(function() {
                setInterval(function () {
                    if ((wait == 0) && (ws.bufferedAmount == 0)) {   // On vérifie que tout a bien déjà été envoyé
                        if (local_tick % fps == 0) {  // specify the refresh rate of the typ2 datas -> 1 time per second
                            ws.send("2")
                        } else {
                            ws.send("3")
                        }
                        local_tick++;
                    }
                }, 1000 / fps);
            }, 0);
        };
    }
    if (broadcast == 1) {
 		ws3 = new WebSocket("ws://"+internetIP+":8003//");
        // Socket for the broadcast communications
		ws3.onmessage = function(d) {
            var datas = d.data;
            update_datas(datas);
        };
		ws3.onclose = function() {
            setTimeout(function () {location.reload()},1000)
            ws3.close();
        };
		window.onbeforeunload = function() {
			ws3.onclose = function () {}; // disable onclose handler first
			ws3.close()
		};
        ws3.onopen = function () {
            ws3.send("send_statics");    // we want to collect the statics datas (name, num, ir)
            // We define the refresh rate for the datas
            broadcast_tick = 0
            setInterval(function(){
                if (ws3.bufferedAmount == 0) {
                    if (broadcast_tick % 5 == 0) {  // specify the refresh rate of the typ2 datas
                        ws3.send("2")
                    } else {
                        ws3.send("3")
                    }
                    broadcast_tick++;
                }
            } , 1000/fps_broadcast);
        };
    }
}
