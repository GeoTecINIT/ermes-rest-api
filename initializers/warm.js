var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var config = require('../config/environment');

var sequelize = new Sequelize(config.WARM.db, config.WARM.auth.user, config.WARM.auth.pass, {
  host: config.WARM.host,
  port: config.WARM.port,
  dialect: 'postgres',

  pool: {
    max: 25,
    min: 0,
    idle: 10000
  }
});

sequelize.initModels = function() {
  "use strict";

  // Initialize WARM models
  return new Promise(function (resolve, reject) {
    console.log('\t* Initializing WARM models...');

    // Read and import WARM models from models dir
    fs.readdir('./models/warm', (err, files) => {

      files.forEach((file) => {
        sequelize.import(path.resolve('./models/warm/' + file));
      });
      resolve();

    });
      
  }).then(() => {
    console.log('\t-> DONE Initializing WARM models');
    return sequelize.sync();
  }).catch((err) => {
    console.error('\t-> ERROR Initializing WARM models' + err);
  });

};

module.exports = sequelize;

