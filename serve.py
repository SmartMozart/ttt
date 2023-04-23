import flask

app = flask.Flask('')

@app.route('/<path>')
def route(path):
	try:
		return flask.send_file(path)
	except:
		return 'null'

app.run('0.0.0.0', 8000)