var express = require('express');
var router = express.Router();

module.exports = function(passport)
{
    //Login page: GET
    router.get('/', function(req, res) {
        res.send("ERMES RESTful API");
    });

    var proxy = require("./routes/proxy")();
    router.use("/proxy", proxy);

    var config = require("./routes/config")();
    router.use("/config", config);

    var mailer = require("./routes/mailer")();
    router.use("/sendmail", mailer);

    var api = require("./routes/api-v1")();
    router.use("/api-v1", api);

    // TODO: Change the way of user lookup
    //var acceptRegistration = require("./routes/accept-registration")();
    //router.use("/accept-registration", acceptRegistration);

    var infoTemplates = require("./routes/info-template")();
    router.use("/info-template", infoTemplates);

    var formTemplates = require("./routes/form-template")();
    router.use("/form-template", formTemplates);

    //var login = require("./routes/auth/login")(passport);
    //router.use("/login", login);

    //var signup = require("./routes/auth/signup")(passport);
    //router.use("/signup", signup);

    return router;
};
