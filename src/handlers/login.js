const express = require('express');

const router = express.Router();
const https = require('https');
const queryString = require('querystring');


router.post('/login', (req, res) => {
	const user = req.body;
	const username = user.username;
	const password = user.password;
	const options = {
		method: 'POST',
		url: (process.env.openIDDirectAccessEnpoint),
		headers: { 'content-type': 'application/x-www-form-urlencoded' }
	};
	const form = {
		username,
		password,
		client_id: (process.env.openIDClientID),
		grant_type: 'password',
		client_secret: (process.env.openIDClientSecret)
	};
	const formData = queryString.stringify(form);

	const reqs = https.request(process.env.openIDDirectAccessEnpoint, options, (ress) => {
		ress.setEncoding('utf8');
		let data = '';
		ress.on('data', (chunk) => {
			data += chunk;
		});
		ress.on('end', () => {
			const json = JSON.parse(data);
			if(ress.statusCode == 200) {
				return res.status(200).json(json);
			} else {
				throw new error(JSON.stringify({message: 'serviceTokenExchange failed', responseCode : ress.statusCode, responseBody: ress.body, json: JSON.stringify(json, null, 4)}));
			}
		});
	});

	reqs.on('error', (e) => {
		throw new error('Error exchanging token: ' + JSON.stringify(e, null, 4));
	});

	reqs.write(formData);

	reqs.end();
});


module.exports = router;
