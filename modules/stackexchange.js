module.exports = async (Data) => {
	return {
		name: 'stackexchange',
		version: '0.0.1',
		show: true,
		apiURL: "https://api.stackexchange.com/2.2/",

		run (url) {},
		async getQuestionAnswers (id, site="stackoverflow", filter="!t)HOqwbcu.kaaxuI(k5c7Ot5FT-Ydf5") {
			return (await Data.axios.get(`${this.apiURL}questions/${id}/answers?order=desc&sort=activity&site=${site}&filter=${filter}`)).data.items;
		},
		async getQuestionAndAnswers (id, site="stackoverflow", filter="!-y(KwOjRxMln-hCoHpVCNKfpWKRl1TJLxV*-Ji8na") {
			try {
				let res = await Data.axios.get(`${this.apiURL}questions/${id}?order=desc&sort=activity&site=${site}&filter=${filter}`);
				console.log(res);
				return res.data.items[0];
			} catch (err) {
				console.log(err);
			}
		},
		parseURL (url) {
			return {
				id: this.parseID(url),
				site: this.parseSite(url) || 'stackoverflow'
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