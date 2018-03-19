module.exports = {
	name: 'pastebin',
	run: async (Data, Client) => {
		let trigger = 'getpaste ';
		Client.on('websocket:message:request', async (req, id) => {
			if (req.startsWith(trigger)) {
				let pasteID = req.substring(trigger.length);
				Client.respond(id, await Data.Modules.pastebin.getPasteText(pasteID));
			}
		});
	},
};