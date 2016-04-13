var express = require('express');
var router = express.Router();

var TemplateLoader = require('../utils/template-loader');
var Mailer = require('../utils/mailer');
var config = require('../config/environment');

module.exports = function()
{
  router.get('/', function (req, res) {
    res.send('Sending testing email');

    var token = {
      accept: 'asf9sf8a9s8f78f78asf89f790',
      reject: 'opFArwe890rurwru324oqwpr89'
    };

    var user = {
      username: 'alberto',
      email: 'example@mail.com',
      region: 'spain',
      profile: 'local',
      type: 'owner'
    };

    var url = {
      accept: config.http.PROTOCOL + config.http.HOSTNAME + ":" + config.http.PORT + "/accept-registration?userId=" + user.userId + "&token=" + token.accept,
      reject: config.http.PROTOCOL + config.http.HOSTNAME + ":" + config.http.PORT + "/accept-registration?userId=" + user.userId + "&token=" + token.reject
    };

    var subject;
    var template;
    if (user.type === 'collaborator') {
      subject = "New ERMES Collaboration Proposal [user: " + user.username + "]";
      template = 'new-collaborator';
    } else {
      subject = "New ERMES Registration [user: " + user.username + "]";
      template = 'new-registration';
    }

    TemplateLoader.compileMailTemplate(template, {user, url}).then((html) => {
      Mailer.sendMail(['algonzal@uji.es'], subject, html);
    }).catch((err) => {
      console.error(err);
    });
  });

  return router;
};