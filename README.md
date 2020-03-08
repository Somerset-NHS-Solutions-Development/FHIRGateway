# FHIRGateway
##  Introduction
This is a gaetway service to sit in front of FHIR servers that do not support Open ID connect. This server will check that JWT tokens are valid and have the relvant claims as per the configuration. This service will also record the access in an audit log. This service was built to support secure connectivity as part of the the Somerset Integrated Digital Electronic Record (SIDeR), more details can be found here: https://github.com/Somerset-SIDeR-Programme

## Limitations
This service does not check or validate the FHIR request is valid, this is handled by the downstream server.

## Prerequisites
* [NodeJS](https://nodejs.org/)

## Installation
    $ npm install
    $ cp ./src/.env.TEMPLATE ./src/.env.devlopement
    $ vim ./src/.env.devlopement

Update config with appropriate values:

    #Service
    listenOn=8080

    #OpenID Connect Endpoint
    openIDDirectAccessEnpoint=https://keycloak/auth/realms/realm/protocol/openid-connect/token
    openIDClientID=client
    openIDClientSecret=
    jwksUri='https://openidserver/openid-connect/certs'
    AccessClaimPath=accessclaim
    AccessRolesAllowed= '','',''

    #CORS
    corsEnabled=true
    allowedOrigins='http://example1.com','http://example2.com'

    #Downstream FHIR Server https://user:pass@fhirsserver.local
    FHIRServerBaseURL=

    #Logging
    LogDir=/tmp/log
    LogLevel=debug

## Launch
#### Dev
    $ npm run dev
#### Production
    $ npm run start
    
## Usage
  Bearer token must be set. This is checked and audited as set by the configuration.
  
    curl --request GET \
      --url 'http://localhost:8080/patient?identifier=https%3A%2F%2Ffhir.nhs.uk%2FId%2Fnhs-number%7C1111111111' \
      --header 'authorization: Bearer <token>'

