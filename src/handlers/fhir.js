const verifyToken = require('./verify-token');
const express = require('express');

const router = express.Router()
const rp = require('request-promise');

// Set Up Logging
const logger = require('./logger');


// Asynch Middleware
const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next);
};


// Functions

function getFhirResponseFunc(path = '/', queryString) {
	logger.debug(`Request being forwarded to ${process.env.FHIRServerBaseURL}${path}`);
	logger.debug(`Request query parameters: ${JSON.stringify(queryString)}`);
	const options = {
		uri: process.env.FHIRServerBaseURL+path,
		qs: queryString,
		headers: {
			// "Authorization" : auth,
			'User-Agent': 'FHIR-Proxy'
			
		}
	};
	return rp(options)
}

const getFhirResponse = async (req,res,next) => {
	logger.debug('New request');
	logger.debug(`Request path: ${JSON.stringify(req.path)}`);
	logger.debug(`Request query parameters: ${JSON.stringify(req.query)}`);	
	const response = await getFhirResponseFunc(req.path,req.query)
	res.end(response); 	
	next;
}



// Routes
router.get('/*', verifyToken, asyncMiddleware(getFhirResponse));

module.exports = router;