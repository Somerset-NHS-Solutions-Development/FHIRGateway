const express = require('express');
const bodyParser = require('body-parser')
const router = express.Router()
const rp = require('request-promise');
const verifyToken = require('./verify-token');

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
	if(rmethod == 'PUT' || rmethod == 'POST') {
		options['body'] = JSON.stringify(rbody);
	}
	return rp(options)
}

const getFhirResponse = async (req,res,next) => {
	
	logger.debug('New FHIR request');
	logger.debug(`Request path: ${JSON.stringify(req.path)}`);
	logger.debug(`Request query parameters: ${JSON.stringify(req.query)}`);
	logger.debug(`Request Content Type: ${req.header('content-type')}`);
	logger.debug(`Request raw body ${req.rawBody}`)
	logger.debug(`Request parsed body ${req.body}`)
	
	const response = await getFhirResponseFunc(req.path,req.query, req.method, req.headers, req.body)
	res.end(response); 	
	next;
}


// Routes
router.get('/*', verifyToken, asyncMiddleware(getFhirResponse));
router.put('/*', verifyToken, asyncMiddleware(getFhirResponse));
router.post('/*', verifyToken, asyncMiddleware(getFhirResponse));

module.exports = router;