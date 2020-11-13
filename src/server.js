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

var myRawParser = function(req, res, next){
    req.rawBody = '';
	logger.debug(`Request Content Length: ${req.headers['content-length']}`);
    if(req.header('content-type') !== 'application/json' && req.headers['content-length'] < 20000000){
        req.on('data', function(chunk){
            req.rawBody += chunk;
        })
        req.on('end', function(){
            next();
        })
    } else {
        next();
    }
}



// Middleware
server.use(helmet());
server.use(cors(corsOptions));
//server.use(myRawParser);
server.use(bodyParser.json({ strict: false, type: ["application/fhir+json","application/json"]}));
server.use(bodyParser.urlencoded({extended: false}));




// router

const login = require("./handlers/login");
const fhir = require("./handlers/fhir");

server.use('/auth', login);
server.use('/', fhir);


server.listen(process.env.listenOn, () => {
		logger.info(`Platform: ${process.platform}`);
		logger.info(`Listening on port ${process.env.listenOn}`);
	});