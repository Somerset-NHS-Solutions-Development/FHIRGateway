const jwt = require('jsonwebtoken');
// Verify using getKey callback
// Uses https://github.com/auth0/node-jwks-rsa as a way to fetch the keys.
const jwksClient = require('jwks-rsa');

// Set Up Logging
const audit = require('./auditlogger.js');
const logger = require('./logger.js');

async function getSigningKey(token) {
	return new Promise((resolve, reject) => {
		const client = jwksClient({
			strictSsl: true, // Default value
			jwksUri: (process.env.jwksUri)
		});
		const decoded = jwt.decode(token, { complete: true });
		client.getSigningKey(decoded.header.kid, (err, key) => {
			if (err) {
				logger.error(err);
				reject(err);
			} else {
				const signingKey = key.publicKey || key.rsaPublicKey;
				resolve(signingKey);
			}
		});
	});
}

module.exports = async (req, res, next) => {
	try {
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(' ')[1];
			const signingKey = await getSigningKey(token);
			const options = { ignoreExpiration: false, maxAge: '15m', algorithms: ['RS256'] };
			const claimPath = process.env.AccessClaimPath;
			jwt.verify(token, signingKey, options, (err, vdecoded) => {
				if (err) {
					throw new Error('Unable to verify token');
				}
				req.userData = vdecoded;
				req.userAccess = vdecoded[claimPath];

				// Check Roles at least one role is present
				let found = 0;
				if ((process.env.AccessRolesAllowed).includes(',')) {
					(process.env.AccessRolesAllowed).split(',').forEach((item) => {
						if (req.userAccess.indexOf(item.trim()) !== -1) {
							found = 1;
						}
					});
				} else if (req.userAccess.indexOf(process.env.AccessRolesAllowed.trim()) !== -1) {
					found = 1;
				}
				if (found === 0) {
					throw new Error(`Roles not found: ${JSON.stringify(vdecoded)}`);
				}

				audit.info(`Audit Success: ${JSON.stringify(vdecoded)}`);
			});
			next();
		} else {
			throw (new Error('Authorisation header not set.'));
		}
	} catch (err) {
		audit.error(`Audit Failure: ${err}`);
		logger.error(err);
		res.status(401).json({
			message: 'Authorisation failed.'
		});
		res.end();
	}
};
