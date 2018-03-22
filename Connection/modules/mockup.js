module.exports = {
	name: 'mockup',
	run: async (Data, Client) => {
		Client.on('hc:websocket:message:chat', args => {
			console.log(args.nick + (args.trip ? '#' + args.trip : '') + ': ' + args.text);
		});
	},
};