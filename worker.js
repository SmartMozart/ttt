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

onmessage = (e) => {
	let [event, data] = e.data;
	if (event == 'action') {
		action(data);
	} else if (event == 'since') {
		since(data);
	}
}

function action(params) {
	let payload = {"action": params[0], "secret": params[1], "params": params[2]}
	api('POST', '/action', payload);
}

function since(time) {
	let changes = api('GET', '/since/'+time.toString());
	if (changes.length == 0) {
		return;
	}
	let new_playerdata = api('POST', '/players', changes);
	postMessage(['updates', new_playerdata]);
}