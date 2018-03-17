module.exports = async (Data) => {
	console.log('mockup module loaded');
	return {
		name: 'mockup-beep',
		version: '0.0.1',
		run () {
			console.log('mockup goes beep, because it is a test.');
		}
	}
}