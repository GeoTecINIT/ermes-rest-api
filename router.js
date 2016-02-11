var express = require('express');
var router = express.Router();

module.exports = function(passport)
{
    //Login page: GET
    router.get('/', function(req, res) {
        res.send("ERMES RESTful API");
    });

    var apiV1 = require("./routes/api-v1");
    router.use("/api-v1", apiV1(passport));

    var proxy = require("./routes/proxy");
    router.use("/proxy", proxy());

    var config = require("./routes/config");
    router.use("/config", config());

    var mailer = require("./routes/mailer");
    router.use("/sendmail", mailer());

    // TODO: Change the way of user lookup
    //var acceptRegistration = require("./routes/accept-registration");
    //router.use("/accept-registration", acceptRegistration());

    var infoTemplates = require("./routes/info-template")();
    router.use("/info-template", infoTemplates);

    var formTemplates = require("./routes/form-template")();
    router.use("/form-template", formTemplates);

    var login = require("./routes/auth/login");
    router.use("/login", login(passport));

    return router;
};
