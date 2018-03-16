module.exports = {
	name: 'mockup',
	run: async (Data, Client) => {
		Client.on('websocket:message', args => console.log(JSON.stringify(args).split('').reverse().join('')));
	}
};