var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var config = require('../config/environment');

var sequelize = new Sequelize(config.SQL.db, config.SQL.auth.user, config.SQL.auth.pass, {
  host: config.SQL.host,
  dialect: 'postgres',

  pool: {
    max: 25,
    min: 0,
    idle: 10000
  },

  define: {schema: config.SQL.defaultSchema}
});

sequelize.initModels = function(syncParameters) {
  "use strict";
  return new Promise(function (resolve, reject) {
    console.log('\nInitializing models...\n=================================');
    fs.readdir('./models', (err, files) => {
      "use strict";

      files.forEach((file) => {
        sequelize.import(path.resolve('./models/' + file));
      });
      sequelize.sync(syncParameters)
        .then((res) => {
          console.log('=================================\nInitializing models... DONE\n');
          resolve(res)
        })
        .catch((err) => {
          console.error('=================================\nInitializing models... ERROR\n' + err);
          reject(err)
        });
    });
  });
};

module.exports = sequelize;

