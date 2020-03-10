require('custom-env').env('development');

// Express HTTP server
const express = require('express');

const server = express();
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');

// Set Up Logging
const logger = require('./handlers/logger');

// Setup CORS
let corsOptions = {};
if(process.env.corsEnabled.toLowerCase() === 'true'){
	const whitelist = [];
	if((process.env.allowedOrigins).includes(',')) {
		(process.env.allowedOrigins).split(',').forEach((item) => {
			whitelist.push(item.trim());
		});
	} else {
		whitelist.push(process.env.allowedOrigins);
	}
	corsOptions = {
	  origin: (origin, callback) => {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error('CORS failed'));
		}
	  }
	}
}



// Middleware
server.use(helmet());
server.use(cors(corsOptions));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));


// router

const login = require("./handlers/login");
const fhir = require("./handlers/fhir");

server.use('/auth', login);
server.use('/', fhir);


server.listen(process.env.listenOn, () => {
		logger.info('Platform: '+process.platform);
		logger.info('Listening on port '+process.env.listenOn);
	});