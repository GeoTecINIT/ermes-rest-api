var express = require('express');
var router = express.Router();
var multer  = require('multer');
var path = require('path');
var sequelize = require('../initializers/db');

var config = require('../config/environment');
var ImageModel = sequelize.import(path.resolve('./models/local/image'));

var imageUpload = multer({
    dest: path.resolve('./images'),
    limits: {fileSize: 15000000, files: 1}
});

module.exports = function(passport) {
    router.get('/:filename', function(req, res) {
        var filename = req.params.filename;
        new Promise((resolve, reject) => {
            var notFound = new Error('File not found');

            if (filename !== '.gitkeep') {
                res.sendFile(path.resolve('./images') + '/' + filename, {}, function(err, info) {
                    if (err) {
                        reject(notFound);
                    } else {
                        resolve();
                    }
                });
            } else {
                reject(notFound);
            }
        }).catch((ex) => {
            res.status(404).json({errors: [{type: ex.name, message: ex.message}]});
        });
    });

    router.post('/', passport.authenticate('login', {session: false}), imageUpload, function(req, res) {
        var image = req.files.image;
        var user = req.user;

        new Promise((resolve, reject) => {
            if (image) {
                return resolve();
            }
            return reject();
        }).then(() => {
            return ImageModel.create({userId: user.userId, file: image.name});
        }).then((data) => {
            res.status(201).json({image: {id: data.id, url: config.http.PROTOCOL + config.http.HOSTNAME + ':' + config.http.PORT + '/images/' + image.name}});
        }).catch((ex) => {
            res.status(200).json({errors: [{type: ex.name, message: ex.message}]});
        });
    });

    return router;

};
