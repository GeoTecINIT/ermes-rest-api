var path = require('path');
var sequelize = require('../initializers/db');

function init() {
  var User = sequelize.import(path.resolve('./models/local/user'));
  User.findAll({where: {type: 'guest'}}).then((guests) => {
    if (guests.length === 0) {
      User.bulkCreate([
        {username: 'guestls', password: 'q1w2e3r4t5y6', region: 'spain', profile: 'local', type: 'guest', email: 'guestls@ermes.com', language: 'es', active: true},
        {username: 'guestli', password: 'q1w2e3r4t5y6', region: 'italy', profile: 'local', type: 'guest', email: 'guestli@ermes.com', language: 'it', active: true},
        {username: 'guestlg', password: 'q1w2e3r4t5y6', region: 'greece', profile: 'local', type: 'guest', email: 'guestlg@ermes.com', language: 'el', active: true},
        {username: 'guestrs', password: 'q1w2e3r4t5y6', region: 'spain', profile: 'regional', type: 'guest', email: 'guestrs@ermes.com', language: 'es', active: true},
        {username: 'guestri', password: 'q1w2e3r4t5y6', region: 'italy', profile: 'regional', type: 'guest', email: 'guestri@ermes.com', language: 'it', active: true},
        {username: 'guestrg', password: 'q1w2e3r4t5y6', region: 'greece', profile: 'regional', type: 'guest', email: 'guestrg@ermes.com', language: 'el', active: true},
        {username: 'guestrgamb', password: 'q1w2e3r4t5y6', region: 'gambia', profile: 'regional', type: 'guest', email: 'guestrgamb@ermes.com', language: 'en', active: true},
        {username: 'guestrgsrv', password: 'q1w2e3r4t5y6', region: 'gambia-srv', profile: 'regional', type: 'guest', email: 'guestrgsrv@ermes.com', language: 'en', active: true}
      ]);
    }
  });
  User.findOne({where: {username: 'admin'}}).then((user) => {
    if (!user) {
      User.create({username: 'admin', password: 'q1w2e3r4t5y6', region: 'spain', profile: 'regional', type: 'admin', email: 'admin@ermes.com', language: 'en', active: true});
    }
  });
}

module.exports = {
  init: init
};