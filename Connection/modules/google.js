module.exports = {
	name: 'google',
	run: async (Data, Client) => {
		let trigger = 'googlesearch ';
		Client.on('websocket:message:request', async (req, id) => {
			if (req.startsWith(trigger)) {
				let searchQuery = req.substring(trigger.length);
				Client.respond(id, await Data.Modules.google.search(searchQuery));
			}
		});
	},
};