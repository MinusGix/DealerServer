module.exports = async (Data) => {
	let { readJSON, EventEmitter, fs } = Data;
	
	try {
		var ConnectionConfig = await readJSON(__dirname + "/config.json");
	} catch (err) {
		throw new Error("Error in loading ConnectionConfig. " + err.toString());
	}

	class Connection extends EventEmitter {
		constructor () {
			super();

			this.modules = {};

			this.connector = null;

			this.load()
				.then(_ => console.log('All loaded'))
				.catch(err => console.log('[ERROR] Problem with loading Connection files! ' + err.toString()))
		}

		async load () {
			try {
				await this.loadConnector();
			} catch (connectorError) {
				throw connectorError;
			}
			
			console.log('Loaded Connector');

			try {
				this.loadModules()
			} catch (moduleError) {
				throw moduleError;
			}
			
			console.log("Loaded Connection Modules");
			this.connect();
		}

		async loadConnector () { // todo: add subconnectors
			let connectorList = ConnectionConfig.connector; 

			let connector = require(__dirname + '/connectors/' + connectorList[0]);
			
			await connector.init(Data, this);

			this.connector = connector;

			return connector;
		}

		cdeclareModule () {
			return this.declareModule.bind(this);
		}

		async declareModule (mod) {
			let name = mod.name;
			this.modules[name] = mod;
			
			await mod.run(Data, this);

			return this; // for chaining
		}

		loadModules () {
			return new Promise((resolve, reject) => fs.readdir(__dirname + '/modules/', (err, files) => {
				if (err) {
					return reject(err);
				}

				files
					.filter(file => file.endsWith('.js'))
					.map(file => require(__dirname + '/modules/' + file))
					.forEach(this.cdeclareModule());
				
				resolve();
			}))
		}

		connect () {
			this.emit('pre:connecting', this);

			if (typeof(this.connector.connect) === 'function') {
				this.connector.connect();
			}

			this.emit('after:connecting', this);
		}

		creceive () {
			return this.receive.bind(this);
		}
		async receive (data) { // data is of unknown type, the connector will let us know if it's useful and if we should continue with it
			if (typeof(this.connector.parseData) === 'function') { // run the function on the data, assume the data is fine by itself if the function doesn't exist
				data = await this.connector.parseData(data);
			}

			if (typeof(this.connector.dataShouldBeUsed) === 'function') { // run the function on the data, assume the data is fine if it doesn't exist
				if (!(await this.connector.dataShouldBeUsed(data))) {
				//	return; // data is not to be used for anything, rip
				}
			}

			let text = data; // assume data is fine as text if the function doesn't exist

			if (typeof(this.connector.grabText) === 'function') {
				text = await this.connector.grabText(data);
			}
			if (text.startsWith('REQUEST:')) {
				let id = text.substring(8);
				id = id.substring(0, id.indexOf(':'));

				this.emit('message:request', text.substring(8 + id.length + 1), id, data, this);
			}
		}

		sendText (text) {
			if (typeof(this.connector.sendText) === 'function') {
				this.connector.sendText(text);
			} else {
				console.log('[WARN] The connector named "' + (this.connector.name || 'UNNAMED CONNECTOR') + '" does not have a function to send text.');
			}
		}

		respond (id, text) {
			let isJSON = typeof(text) === 'object';

			if (isJSON) {
				try {
					text = JSON.stringify(text);
				} catch (error) {
					// todo: make it tell the client to kill off that request and inform the user
					return console.error('[ERROR] in parsing json. id:', id, '\ntext(object):', text, '\nerror:', error);
				}
			}
			let compressedText = Data.compress(text);
			console.log('RESPONDING\n\tORIGINAL TEXT: ' + text.length + '\n\tCOMPRESSED TEXT: ' + compressedText.length);
			this.sendText("RC" + (isJSON ? 'J' : 'T') + ':' + id + ":" + compressedText); // RU is response, RC is response-compressed. J is JSON and T is text
		}
	}

	return {
		Connection,
		ConnectionConfig
	};
};