module.exports = async (Data) => {
	return {
		name: 'stackexchange',
		version: '0.0.1',
		show: true,
		run (url) {},
		async getQuestionAnswers (id, site="stackoverflow") {
			return (await Data.axios.get(`https://api.stackexchange.com/2.2/questions/8287167/answers?order=desc&sort=activity&site=${site}&filter=!WXiIETACIU-sfj1EnE7ERcE82xydEKEkmRQ*wJm`)).data.items;
		}
	}
}