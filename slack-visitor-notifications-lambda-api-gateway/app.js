const https = require(`https`);
const { URL }= require('url');

/*
* Send a POST request to the Slack webhook URI.
*/
async function pushToSlack (webhookUri, delType, content, attachedImgUrl, nameVisitor) {

	// Skip if there is no webhook URI.
	console.log('im invoked');

	if (!webhookUri) { return; }

	/*
	* Created the promise to slack api
	*/

	return await new Promise((resolve, reject) => {

		const uri = new URL(webhookUri);

		/*
		* Creates a json that is posted to slack api
		*/

		const postData = JSON.stringify({
			text: content,
			text: content,
			attachments: [
				{
					fallback: "Required plain-text summary of the attachment.",
					title: nameVisitor,
					title_link: attachedImgUrl,
					text: "Picture of your visitor",
					image_url: attachedImgUrl
				}
			]
		});

		/*
		*  Creates a post request using https module
		*/

		const req = https.request({
			protocol: uri.protocol,
			hostname: uri.hostname,
			port: 443,
			method: `POST`,
			path: uri.pathname,
		}, res => {

			const resData = [];

			res.setEncoding(`utf8`);

			// Are we redirecting?
			if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
				const redirectPromise = pushToSlack(res.headers.location);
				return resolve(redirectPromise);
			}

			// Otherwise get the response payload.
			res.on(`data`, chunk => resData.push(chunk));
			res.on(`end`, () => {
				const result = resData.join(``);
				if (result !== `ok`) { return reject(new Error(`Expected Slack response to be "ok" but got "${result}".`)); }
				return resolve();
			});
			res.on(`error`, err => reject(err));

		});

		req.end(postData);
	});
}


exports.handler = async (event, context, callback) => {

	/*
	* If statement splits messages between #visitors and #mailroom depending on the source of the email
	*/

	const deliveryType = event['HtmlBody'].match(/package/i) ? 'package' : 'letter';

	if (event['Bcc'].match(/visitor@team-notifications\.recombix\.com$/i)) {
		/*
		* These constants extract the visitor image url from the body of the email and teransform it to an accessable format
		*/


		const [ , visitorPhotoUrlRaw ] = event['HtmlBody'].match(/"(https:\/\/.+\.welkio\.com\/images\/visitors\/[\S\n\r]+)"/i) || [];
		const visitorPhotoUrl = (visitorPhotoUrlRaw || ``).replace(/=\n/g, ``);
		const nameVisitor = (event.Subject.match(/guest:([^.]+)/i)[1]);
		const content = `Visitor *${nameVisitor}* has arrived to see ${event.ToFull[0].Name}.`;

		await pushToSlack('https://hooks.slack.com/services/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', deliveryType, content, visitorPhotoUrl, nameVisitor);

	} else if (event['Bcc'].match(/mailroom@team-notifications\.recombix\.com$/i)) {
		const content = `There is a *${deliveryType}* waiting in the mailroom :love_letter:`;

		await pushToSlack('https://hooks.slack.com/services/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', deliveryType, content);
		callback.send('I work too');
	}

	callback(null, 'ok');

};
