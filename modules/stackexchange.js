module.exports = async (Data) => {
	return {
		name: 'stackexchange',
		version: '0.0.1',
		show: true,
		run (url) {},
		async getQuestionAnswers (id, site="stackoverflow") {
			return (await Data.axios.get(`https://api.stackexchange.com/2.2/questions/8287167/answers?order=desc&sort=activity&site=${site}&filter=!WXiIETACIU-sfj1EnE7ERcE82xydEKEkmRQ*wJm`)).data.items;
		},
		parseURL (url) {
			return {
				id: this.parseID(url),
				site: this.parseSite || 'stackoverflow'
			};
		},
		parseURLArray (url) { // for easy spreading getQuestionAnswers(...parseURLArray(url))
			let parsed = this.parseURL(url);
			
			return [parsed.id, parsed.site];
		},
		parseID (url) {
			return url
				.replace(/^(?:http(?:s|):\/\/|)(?:www\.|)(?:.*?\.com)(?:\/questions\/)/, '')
				.replace(/(?!\d).*$/, '')
				.replace(/(?:[a-zA-Z])/g, '');
		},
		parseSite (url) {
			return url
				.replace(/^(?:http(?:s|):\/\/|)(?:www\.|)/, '')
				.replace(/(?=.*?)\..*$/, '')
				.toLowerCase();
		},
	}
}