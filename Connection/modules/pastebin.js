module.exports = {
	name: 'pastebin',
	run: async (Data, Client) => {
		let trigger = 'getpaste ';
		Client.on('websocket:message:request', async (req, id) => {
			console.log('pasteybin! ', req);
			if (req.startsWith(trigger)) {
				let pasteID = req.substring(trigger.length);
				console.log(pasteID);
				Client.respond(id, await Data.Modules.pastebin.getPasteText(pasteID));
			}
		});
	},
};