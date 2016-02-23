var fs = require('fs');
var path = require('path');

var streams = {
  info: fs.createWriteStream(path.resolve('./logs/info.log'), {flags: 'a'}), // Append
  error: fs.createWriteStream(path.resolve('./logs/error.log'), {flags: 'a'}) // Append
};

module.exports = streams;