var environment = {
  http: {
    PORT: process.env.PORT || 3000
  },
  SQL: {
    db: process.env.POSTGRES_DB || '_test',
    host: 'localhost',
    auth: {
      user: 'nodetest',
      pass: 'qwerty12345'
    }
  }
};

module.exports = environment;
