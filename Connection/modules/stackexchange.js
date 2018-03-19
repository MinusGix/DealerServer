module.exports = {
	name: 'pastebin',
	run: async (Data, Client) => {
		let trigger = 'getstackexchangeanswers ';
		Client.on('websocket:message:request', async (req, id) => {
			if (req.startsWith(trigger)) {
				let questionID = req.substring(trigger.length);
				Client.respond(id, await Data.Modules.stackexchange.getQuestionAnswers(questionID));
			}
		});
	},
};