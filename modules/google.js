module.exports = async (Data) => {
	let google = require('google');
	google.resultsPerPage = 5;
	return {
		name: 'google',
		version: '1.0.0',
		run () {},
		setResutlsPerPage (n=5) {
			google.resultsPerPage = n;
		},
		setLanguage (lang='en') {
			google.lang = lang; // may not work, as the example set tld and nextText. so probably not.
		},
		search (query) {
			return new Promise((resolve, reject) => {
				google(query, (err, res) => {
					// you can use res.next() to get the next page

					if (err) return reject(err);

					// for some reason, the google nodemodule has item.link and item.href which arre both
					// set to exactly the same value. we want to remove this, because small text is what we
					// need to be sent over
					resolve(
						res.links.map(link => (
							{
								href: link.href, // the link to the page
								title: link.title, // the title of the page. tempted to remove it.
								description: link.description, // description of the page. possibly add option to not have it
							}
						))
					);
				});
			});
		}
	}
}