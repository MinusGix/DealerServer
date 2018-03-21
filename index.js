(async () => {
const WebSocket = require('ws');
const fs = require('fs');
const EventEmitter = require('events');
const Nightmare = require('nightmare');
const lzstring = require('lz-string');
const URL = require('url').URL;
const axios = require('axios');

async function asyncMap(arr, callback) {
	let results = []; 
	for (let i = 0; i < arr.length; i++) {
		results[i] = await callback(arr[i], i, arr); //bleh, TODO: make this paralell
	}
	return results;
}

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
				asyncMap(
					files
						.filter(file => file.endsWith('.js')), 
					async file => {
						let mod = await require(__dirname + '/modules/' + file)(Data)
						mod.__filename = file;
						return mod;
					}
				)
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
	Nightmare,
	lzstring,
	URL,
	axios,
	readJSON,

	compress: lzstring.compressToUTF16,
	decompress: lzstring.decompressFromUTF16, // if for some reason we need too

	Modules: {}
};

try {
	let modules = await loadModules(Data);
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

let Client = new Connection();

})(); // I dislike this.