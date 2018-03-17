module.exports = {
	name: 'pastebin',
	run: async (Data, Client) => {
		let trigger = 'getpaste ';
		Client.on('websocket:message:chat', async args => {
			if (args.text.startsWith(trigger) && args.nick !== Client.username) {
				let pasteID = args.text.substring(trigger.length);
				Client.sendText('Result: ' + (await Data.Modules.pastebin.getPasteText(pasteID)));
			}
		});
	},
};