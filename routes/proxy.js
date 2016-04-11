var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('helpers/config');

module.exports = function()
{
    router.get('/', function (req, res) {
        var urlData = req.originalUrl.split(config.proxyUrl + '?');
        //console.log(urlData);
        if (urlData[1] == undefined) {
            res.send("Wrong Use of proxy");
        }
        else {
            req.pipe(request(urlData[1]))
              .on('response', function (response) {
                  //console.log("PROXY: Redirect: " + urlData[1]);
              })
              .on('error', function (err) {
                  //console.log("PROXY: Illegal arg catched" + err);
              })
              .pipe(res);
        }
    });
    return router;
}
