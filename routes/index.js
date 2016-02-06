var express = require('express');
var router = express.Router();

module.exports = function(passport)
{
    //Login page: GET
    router.get('/', function(req, res) {
        res.send("ERMES RESTful API");
    });

    var proxy = require("./proxy")();
    router.use("/proxy", proxy);

    var config = require("./config")();
    router.use("/config", config);

    var mailer = require("./mailer")();
    router.use("/sendmail", mailer);

    var api = require("./api")();
    router.use("/api", api);

    var acceptRegistration = require("./accept-registration")();
    router.use("/accept-registration", acceptRegistration);

    var infoTemplates = require("./info-template")();
    router.use("/info-template", infoTemplates);

    var formTemplates = require("./form-template")();
    router.use("/form-template", formTemplates);

    var login = require("./auth/login")(passport);
    router.use("/login", login);

    var signup = require("./auth/signup")(passport);
    router.use("/signup", signup);

    return router;
}
