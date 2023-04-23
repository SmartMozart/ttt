let networker = new Worker('/worker.js');
let lastTimestamp = Date.now()/1000;

networker.onmessage = (e) => {
	let [event, msg] = e.data;
	if (event == 'updates') {
		let [data, reload] = msg;
		if (reload) {
			window.location.reload()
		}
		for (let [i, p] of Object.entries(data)) {
			if (i in board.players) {
				board.players[i].update(p);
			} else {
				board.players[i] = new Player(i, p);
			}
		}
	}
}

function api(method, path, data) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, 'https://api.dogwater53.us/ttt'+path, false);
  let d;
  if (data) {
	  xhr.setRequestHeader("Content-Type", "application/json");
	  d = JSON.stringify(data);
	}
  xhr.send(d);
  return JSON.parse(xhr.responseText);
}

function action(action, params) {
	networker.postMessage(['action', [action, secret, params]]);
}

function get_board_data(exclude) {
	let board = api('GET', '/board');
	let playerlist = board['players'];
	delete playerlist[playerlist.indexOf(exclude)];
	let players = api('POST', '/players', playerlist);
	return [board['sizex'], board['sizey'], players];
}

function join() {
	let response = api('GET', '/join');
	let id = response['id'];
	let secret = response['secret'];
	let player = response['player'];
	return [id, secret, player];
}

function get_player(id) {
	if (!api('GET', '/exists/'+id)['exists']) {
		localStorage.clear();
		document.location.reload();
	}
	return api('GET', '/player/'+id);
}

function move(x, y) {
	networker.postMessage(['action', ['move', secret, {'x':x,'y':y}]]);
}

function get_updates() {
	let time = Date.now()/1000;
	if (time-lastTimestamp < 1) {
		return;
	}
	networker.postMessage(['since', lastTimestamp-2]);
	lastTimestamp = time;
}