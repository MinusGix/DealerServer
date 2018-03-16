(async () => {
const WebSocket = require('ws');
const fs = require('fs');
const EventEmitter = require('events');

function readJSON (filename) {
	return new Promise((resolve, reject) => {
		fs.readFile(filename, 'utf8', (err, data) => {
			if (err) {
				return reject(err);
			}
			
			let result;

			try {
				result = JSON.parse(data);
			} catch (catchErr) {
				reject(catchErr);
			}

			resolve(result);
		});
	});
}

function writeJSON (filename) {
	console.log("[WARN] writeJSON has not been made yet.");
}

function loadModules (Data) {
	return new Promise((resolve, reject) => {
		fs.readdir(__dirname + '/modules', (err, files) => {
			if (err) {
				return reject(err);
			}
			resolve(
				files
				.filter(file => file.endsWith('.js'))
				.map(async file => {
					let mod = await require(__dirname + '/modules/' + file)(Data)
					mod.__filename = file;
					return mod;
				})	
			);
		});
	})
}

try {
	var Config = await readJSON('JSON/config.json');
} catch (err) {
	throw new Error("Error in loading Main Config. " + err.toString());
}

let Data = {
	Config,
	WebSocket,
	fs,
	EventEmitter,
	readJSON,
	Modules: {}
};

try {
	let modules = await loadModules();
	modules.forEach(mod => Data.Modules[mod.name || mod.__filename] = mod);
} catch (err) {
	console.error('[ERROR] in loading main modules!');
	throw err;
}
console.log('[INFO] Main Modules loaded!');

try {
	var Connection = (await require('./Connection')(Data)).Connection;
} catch (err) {
	throw new Error("Unable to load Connection. " + err.toString());
}

let Client = new Connection(undefined, "programming", "testing", 'fuku');

})(); // I dislike this.