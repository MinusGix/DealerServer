module.exports = async ({ WebSocket, fs, EventEmitter, config:MainConfig, readJSON, writeJSON }) => {
	console.log(MainConfig);
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

			this.loadModules();
			this.connect();
		}

		loadModules () {
			console.log('[INFO] Module loading is not implemented yet');
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
		}

		wsMessage (message) {
			try {
				var args = JSON.parse(message);
			} catch (err) {
				return console.error("[ERROR] in parsing a message from the server. ", message);
			}

			console.log(args);
		}

		wsError (err) {
			console.error('[ERROR] Error in client with username of "' + this.username + '" ', err.toString());
		}
	}

	return {
		Connection,
		ConnectionConfig
	};
};