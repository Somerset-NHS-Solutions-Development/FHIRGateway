const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const verifyToken = require('./verify-token');
const urlparse = require('url');
const https = require('https');

// Set Up Logging
const logger = require('./logger');


// Async Middleware
const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next);
};


// Functions

function getFhirResponseFunc(path = '/', queryString, rmethod,rheaders,rbody) {
	logger.debug(`Request being forwarded to ${process.env.FHIRServerBaseURL}${path}`);
	logger.debug(`Request method: ${JSON.stringify(rmethod)}`);
	logger.debug(`Request query parameters: ${JSON.stringify(queryString)}`);
	logger.debug(`Request body ${JSON.stringify(rbody)}`)
	const options = {
		method: rmethod,
		uri: process.env.FHIRServerBaseURL+path,
		qs: queryString,
		headers: {
			// "Authorization" : auth,
			'User-Agent': 'FHIR-Proxy'
			
		}
	};
	// if(rmethod == 'PUT' || rmethod == 'POST') {
	// 	options['body'] = JSON.stringify(rbody);
	// }
	return new Promise((resolve, reject) => {
		const reqs = https.request(process.env.openIDDirectAccessEnpoint, options, (ress) => {
			ress.on('end', () => {
				return resolve(ress);
			});
		});
	
		reqs.on('error', (e) => {
			return reject('Error exchanging token: ' + JSON.stringify(e, null, 4));
		});
	
		reqs.write(JSON.stringify(rbody));
	
		reqs.end();
	});
}

const getFhirResponse = async (req,res,next) => {
	
	logger.debug('New FHIR request');
	logger.debug(`Request path: ${JSON.stringify(req.path)}`);
	logger.debug(`Request query parameters: ${JSON.stringify(req.query)}`);
	logger.debug(`Request Content Type: ${req.header('content-type')}`);
	logger.debug(`Request raw body ${req.rawBody}`)
	logger.debug(`Request parsed body ${req.body}`)

	const q = urlparse = parse(req.url).query;
	
	const response = await getFhirResponseFunc(req.path, q, req.method, req.headers, req.body)
	res.end(response); 	
	next;
}


// Routes
router.get('/*', verifyToken, asyncMiddleware(getFhirResponse));
router.put('/*', verifyToken, asyncMiddleware(getFhirResponse));
router.post('/*', verifyToken, asyncMiddleware(getFhirResponse));

module.exports = router;