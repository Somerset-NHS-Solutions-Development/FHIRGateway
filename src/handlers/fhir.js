const express = require('express');
const errors = require('request-promise/errors');
const rp = require('request-promise');
const verifyToken = require('./verify-token');

const router = express.Router();


// Set Up Logging
const logger = require('./logger');


// Async Middleware
const asyncMiddleware = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next))
		.catch(next);
};


// Functions

function getFhirResponseFunc(path = '/', queryString) {
	logger.debug(`Request being forwarded to ${process.env.FHIRServerBaseURL}${path}`);
	logger.debug(`Request query parameters: ${JSON.stringify(queryString)}`);
	const options = {
		uri: process.env.FHIRServerBaseURL + path,
		qs: queryString,
		headers: {
			'User-Agent': 'FHIR-Proxy'
		}
	};

	return rp(options).then((response) => response)
		.catch(errors.StatusCodeError, (reason) => {
			// The server responded with a status codes other than 2xx.
			// Check reason.statusCode
			logger.error(JSON.stringify(reason));
		})
		.catch(errors.RequestError, (reason) => {
			// The request failed due to technical reasons.
			// reason.cause is the Error object Request would pass into a callback.
			logger.error(JSON.stringify(reason));
		});
}

const getFhirResponse = async (req, res) => {
	logger.debug('New request');
	logger.debug(`Request path: ${JSON.stringify(req.path)}`);
	logger.debug(`Request query parameters: ${JSON.stringify(req.query)}`);
	const response = await getFhirResponseFunc(req.path, req.query);
	if (response) {
		res.end(response);
	} else {
		res.status(500).end();
	}
};


// Routes
router.get('/*', verifyToken, asyncMiddleware(getFhirResponse));

module.exports = router;
