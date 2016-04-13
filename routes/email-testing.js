var express = require('express');
var router = express.Router();

var path = require('path');
var _ = require('underscore');
var sequelize = require('../initializers/db');
var User = sequelize.import(path.resolve('./models/local/user'));

var TemplateLoader = require('../utils/template-loader');
var Mailer = require('../utils/mailer');
var config = require('../config/environment');

module.exports = function()
{
  router.get('/', function (req, res) {
    res.send('Sending testing email');
    
    var product = {
      "product": {
        "productId": 4,
        "uploadDate": "2016-04-13T17:42:00.000Z",
        "shared": false,
        "comments": "This appeared today in my parcel! Should I worry about?",
        "longitude": null,
        "latitude": null,
        "file": "http://ermes.dlsi.uji.es:6787/images/acbea9f234e96ec5f92fcb3f1b1d28ef.jpg"
      },
      "type": "observation",
      "parcels": [
        "ES52346237A00400294A"
      ]
    };
    var user = {
      "userId": 8,
      "username": "albertols",
      "email": "alberto.gonzalez@uji.es",
      "region": "spain",
      "profile": "local",
      "type": "owner",
      "language": "es",
      "active": true,
      "enableAlerts": true,
      "enableNotifications": true
    };

    var subject = "ERMES: " + user.username + " wants to share this observation with you";

    User.findAll({attributes: ['email'], where: {region: user.region,
      $and: {enableNotifications: true, $and: {active: true}}}}).then((users) => {

      var emails = _.without(_.map(users, (user) => user.email), user.email);
      TemplateLoader.loadTemplate('product', product.type).then((productTemplate) => {
        return TemplateLoader.compileMailTemplate('product-notification', {parcels: product.parcels,
          product: product.product, productTemplate, user});
      }).then((html) => {
        Mailer.sendMail(['algonzal@uji.es'], subject, html);
      }).catch((err) => {
        console.error(err);
      });
    });
  });

  return router;
};