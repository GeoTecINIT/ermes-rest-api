var express = require('express');
var router = express.Router();


module.exports = function()
{
    router.get('/:product', function(req, res) {
        var product = req.params.product;
        var route = 'helpers/templates/localProductsInfoTemplates/';
        res.sendFile(product + '.tpl.html', { root: route });
    });

    return router;
}
