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
	readJSON
};

try {
	var Connection = (await require('./Connection')(Data)).Connection;
} catch (err) {
	throw new Error("Unable to load Connection. " + err.toString());
}

let Client = new Connection(undefined, "programming", "testing", 'fuku');

})(); // I dislike this.