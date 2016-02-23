var environment = {
  http: {
    PORT: process.env.PORT || 3000,
    HOSTNAME: 'localhost',
    PROTOCOL: 'http://'
  },
  SQL: {
    db: process.env.POSTGRES_DB || '_test',
    host: 'localhost',
    port: 5432,
    auth: {
      user: 'nodetest',
      pass: 'qwerty12345'
    },
    defaultSchema: 'api'
  }
};

module.exports = environment;
