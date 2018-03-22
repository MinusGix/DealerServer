// A connector made to modify the hackchat connector
module.exports = {
	name: 'hackchat-unrealsecurity',
	async init (Data, Client) {
		Client.connector.state.config.websocketURL = 'wss://vps.unrealsecurity.net/chat-ws';
	}
}