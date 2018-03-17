module.exports = async (Data) => {
	return {
		name: 'pastebin',
		version: '1.0.0',
		show: true,
		run (url) {},
		async getPasteText (id) {
			return (await Data.axios.get('https://pastebin.com/raw/' + id)).data;
		}
	}
};