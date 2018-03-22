// A connection module used for transporting the data rather than 
module.exports = {
	name: 'hackchat',
	
	state: {
		websocketURL: 'wss://hack.chat/chat-ws',
		channel: 'botDev',
		username: 'Transferance',
		password: "Transfer the communism away from me please.",

		pingInterval: 0,
		ws: null,
	},

	_WebSocket: null,
	_Client: null,
	_Data: null,

	async init (Data, Client) {
		this._WebSocket = Data.WebSocket;
		this.state.ws = null;
		
		this._Client = Client;
		this._Data = Data;
	},

	async connect () {
		if (this.state.ws instanceof this._WebSocket) {
			this.kill();
		}

		this.state.ws = new this._WebSocket(this.state.websocketURL);
		this.state.ws.on('open', this._copen());
		this.state.ws.on('message', this._Client.creceive()); // do this
		this.state.ws.on('error', this._error);
	},

	async kill () {
		this.emit('hc:pre:close:websocket', this);

		if (typeof(this.state.pingInterval) === 'number') { // check, even though clearInterval doesn't seem to throw errors
			clearInterval(this.state.pingInterval);
		}
		this.state.pingInterval = null;

		if (this.state.ws instanceof this._WebSocket && typeof(this.state.ws.close) === 'function') {
			this.state.ws.close();
		}
		this.state.ws = null;

		this.emit('hc:after:close:websocket', this);
	},

	_copen () { // curry open
		return this._open.bind(this);
	},

	_open () {
		console.log('Socket open');

		this.state.pingInterval = setInterval(_ => this._ping(), 50000);
		this._join();

		this._Client.emit('hc:websocket:open', this);
	},
	
	async parseData(data) { // converts the data received
		try {
			let args = JSON.parse(data);

			return args;
		} catch (err) {
			throw new Error("[ERROR] in parsing a message from the server. " + err.toString());
		}
	},

	async dataShouldBeUsed (data) {
		return typeof(data) === 'object' && typeof(data.cmd) === 'string' && 
			typeof(data.text) === 'string' && data.nick === 'DealerClient';
	},
	
	async grabText (data) {
		return data.text || '';
	},
	// add more grabs, so it can be more customized via connector

	sendText (text) {
		this._text(text);
	},

	_send (data) {
		if (this.state.ws instanceof this._WebSocket && this.state.ws.readyState === this.state.ws.OPEN) {
			try {
				this.state.ws.send(JSON.stringify(data));
			} catch (err) {
				console.error('[ERROR] Problem in sending (or Stringifying) obj. ', data, err);
			}
		}
	},

	_ping () {
		this._send({ cmd: 'ping' });
	},

	_text (text) {
		this._send({ cmd: 'chat', text });
	},

	_invite (nick) {
		this._send({ cmd: 'invite', nick });
	},

	_join () {
		this._send({
			cmd: 'join',
			nick: this.state.username + (this.state.password ? '#' + this.state.password : ''),
			channel: this.state.channel
		});
	},

	_error (err) {
		console.error('[ERROR] Error in client with username of "' + this.state.username + '" ', err.toString());
		this.emit('hc;websocket:error', err, this);
	}
};