// Used by PM2 for deployment
module.exports = {
    apps : [{
        cwd: __dirname,
        env: {
            NODE_ENV: "production"
          },
        exec_mode: 'cluster',
        instances: 16,
        name: "FHIRGateway",
        script: './src/server.js'
    }]
}