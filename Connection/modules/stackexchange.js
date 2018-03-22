module.exports = {
	name: 'pastebin',
	run: async (Data, Client) => {
		let answersTrigger = 'getstackexchangeanswers ';
		let questionAndAnswersTrigger = 'getstackexchangequestion&answers ';
		Client.on('message:request', async (req, id) => {
			if (req.startsWith(answersTrigger)) {
				let questionID = req.substring(answersTrigger.length);
				Client.respond(id, await Data.Modules.stackexchange.getQuestionAnswers(questionID));
			} else if (req.startsWith(questionAndAnswersTrigger)) {
				let answerID = req.substring(questionAndAnswersTrigger.length);
				Client.respond(id, await Data.Modules.stackexchange.getQuestionAndAnswers(answerID));
			}
		});
	},
};