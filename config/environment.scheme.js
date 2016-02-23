// Copy and rename to environment.js on this same folder

var environment = {
  http: {
    PORT: process.env.PORT || 3000, // With environment variable or with default port
    HOSTNAME: 'server_public_hostname',  // Change
    PROTOCOL: 'http://'  // Change to https if needed
  },
  SQL: {
    db: process.env.POSTGRES_DB || 'database', // Change
    host: 'db_host',  // Change
    port: 5432, // Default PG, change if needed
    auth: {
      user: 'user',  // Change
      pass: 'password'  // Change
    },
    defaultSchema: 'api' // Do not change unless you know what are you doing
  }
};

module.exports = environment;
