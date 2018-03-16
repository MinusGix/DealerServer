module.exports = async (Data) => {
	let { readJSON, EventEmitter, WebSocket, fs } = Data;
	
	try {
		var ConnectionConfig = await readJSON(__dirname + "/config.json");
	} catch (err) {
		throw new Error("Error in loading ConnectionConfig. " + err.toString());
	}

	class Connection extends EventEmitter {
		constructor (
			url=ConnectionConfig.defaults.websocketURL,
			channel=ConnectionConfig.defaults.channel,
			username=ConnectionConfig.defaults.username,
			password=ConnectionConfig.defaults.password
		) {
			super();

			this.websocketURL = url;
			this.channel = channel;
			this.username = username;
			this.password = password;

			this._ws = null;
			
			this._WebSocket = WebSocket;

			this.modules = {};

			this.loadModules()
				.then(_ => this.connect())
				.catch(err => console.error('[ERROR] Problem with reading directory when loading the modules!', err));
		}

		loadModules () {
			return new Promise((resolve, reject) => fs.readdir(__dirname + '/modules/', (err, files) => {
				if (err) {
					return reject(err);
				}
				
				resolve(
					files
						.filter(file => file.endsWith('.js'))
						.map(file => require(__dirname + '/modules/' + file))
						.forEach(async mod => {
							this.modules[mod.name || file] = mod
							await mod.run(Data, this);
						})
				);
			}))
		}

		connect () {
			this.emit('pre:connecting', this);

			if (this._ws instanceof this._WebSocket) {
				this.killSocket();
			}

			this._ws = new WebSocket(this.websocketURL);
			this._ws.on('open', this.wsOpen.bind(this));
			this._ws.on('message', this.wsMessage.bind(this));
			this._ws.on('error', this.wsError.bind(this));
		}

		killSocket () {
			this._ws.close();
			this._ws = null;
		}

		send (obj) {
			if (this._ws.readyState === this._ws.OPEN) {
				try {
					this._ws.send(JSON.stringify(obj));
				} catch (err) {
					console.error('[ERROR] Problem in sending (or Stringifying) obj. ', obj, err);
				}
			}
		}
		sendText (text) {
			return this.send({ cmd: 'chat', text });
		}
		sendInvite (nick) {
			return this.send({ cmd: 'invite', nick});
		}
		sendJoin () {
			return this.send({
				cmd: 'join',
				nick: this.username + (this.password ? '#' + this.password : ''),
				channel: this.channel
			});
		}

		wsOpen () {
			console.log('Socket open');
			this.sendJoin();
			this.emit('websocket:open', this);
		}

		wsMessage (message) {
			try {
				var args = JSON.parse(message);
			} catch (err) {
				return console.error("[ERROR] in parsing a message from the server. ", message);
			}

			this.emit('websocket:message', args, this);
		}

		wsError (err) {
			console.error('[ERROR] Error in client with username of "' + this.username + '" ', err.toString());
			this.emit('websocket:error', err, this);
		}
	}

	return {
		Connection,
		ConnectionConfig
	};
};