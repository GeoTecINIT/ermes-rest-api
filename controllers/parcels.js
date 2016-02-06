var mongoose = require("mongoose");
var User = mongoose.model("User");
var Parcel = mongoose.model("Parcel");
var Soil = mongoose.model("Soil");
var ParcelStatus = mongoose.model("ParcelStatus");
var CropInfo = mongoose.model("CropInfo");
var Yield = mongoose.model("Yield");
var IrrigationInfo = mongoose.model("IrrigationInfo");
var Fertilizer = mongoose.model("Fertilizer");
var Agrochemical = mongoose.model("Agrochemical");
var Phenology = mongoose.model("Phenology");
var bCrypt = require('bcrypt-nodejs');

exports.insertSoil = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.body.username;
    var parcels = JSON.parse(req.body.parcels);
    var password = req.body.password;
    var soil = JSON.parse(req.body.soil);

    var newSoil = new Soil();
    newSoil.soilTexture = soil.soilTexture;
    newSoil.organicMatter = soil.organicMatter;
    newSoil.ph = soil.ph;
    newSoil.date = soil.date;
    newSoil.uploadingDate = soil.uploadingDate;

    User.findOne({'username': name}, function (err, user) {
        if (err){
            return res.status(500).send(err.message);
        }
        else if(user) {

            if(!isValidPassword(user, password))
                return res.status(200).send("Password Wrong.");
            var userParcelsArray = getParcelsArray(user.parcels);

            //Check if all parcels belongs to user
            for (var i = 0; i < parcels.length; i++) {
                if (!contains(userParcelsArray, parcels[i])) {
                    return res.status(200).send("Parcel " + parcels[i]+
                        " does not belong to " + user.username + ".");
                }
            }

            for (var i = 0; i < user.parcels.length; i++) {
                if (contains(parcels, user.parcels[i].parcelId)) {

                    user.parcels[i].soils.push(newSoil);
                }
            }
            user.save(function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                else {

                    return res.status(200).send("OK");
                }
            });
        }
        else return res.status(200).send("User " + name + " does not exists.");
    });
 };

exports.insertParcelStatus = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.body.username;
    var parcels = JSON.parse(req.body.parcels);
    var password = req.body.password;
    var parcelStatus = JSON.parse(req.body.parcelStatus);


    var newParcelStatus = new ParcelStatus();
    newParcelStatus.parcelStatus = parcelStatus.parcelStatus;
    newParcelStatus.date = parcelStatus.date;
    newParcelStatus.uploadingDate = parcelStatus.uploadingDate;

    User.findOne({'username': name}, function (err, user) {


        if (err){
            return res.status(500).send(err.message);
        }
        else if(user) {

            if(!isValidPassword(user, password))
                return res.status(200).send("Password Wrong.");
            var userParcelsArray = getParcelsArray(user.parcels);

            //Check if all parcels belongs to user
            for (var i = 0; i < parcels.length; i++) {
                if (!contains(userParcelsArray, parcels[i])) {
                    return res.status(200).send("Parcel " + parcels[i]+
                        " does not belong to " + user.username + ".");
                }
            }

            for (var i = 0; i < user.parcels.length; i++) {
                if (contains(parcels, user.parcels[i].parcelId)) {
                    console.log(newParcelStatus);
                    user.parcels[i].parcelStatus.push(newParcelStatus);
                }
            }
            user.save(function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                else {

                    return res.status(200).send("OK");
                }
            });
        }
        else return res.status(200).send("User " + name + " does not exists.");
    });
};

exports.insertCropInfo = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.body.username;
   var parcels = JSON.parse(req.body.parcels);
    var password = req.body.password;
    var cropInfo = JSON.parse(req.body.cropInfo);


    var newCropInfo = new CropInfo();
    newCropInfo.cropType = cropInfo.cropType;
    newCropInfo.riceVariety = cropInfo.riceVariety;
    newCropInfo.pudding = cropInfo.pudding;
    newCropInfo.sowingPractice = cropInfo.sowingPractice;
    newCropInfo.date = cropInfo.date;
    newCropInfo.uploadingDate = cropInfo.uploadingDate;


    User.findOne({'username': name}, function (err, user) {

        if (err){
            return res.status(500).send(err.message);
        }
        else if(user) {

            if(!isValidPassword(user, password))
                return res.status(200).send("Password Wrong.");
            var userParcelsArray = getParcelsArray(user.parcels);

            //Check if all parcels belongs to user
            for (var i = 0; i < parcels.length; i++) {
                if (!contains(userParcelsArray, parcels[i])) {
                    return res.status(200).send("Parcel " + parcels[i]+
                        " does not belong to " + user.username + ".");
                }
            }

            for (var i = 0; i < user.parcels.length; i++) {
                if (contains(parcels, user.parcels[i].parcelId)) {
                    user.parcels[i].cropInfos.push(newCropInfo);
                }
            }
            user.save(function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                else {

                    return res.status(200).send("OK");
                }
            });
        }
        else return res.status(200).send("User " + name + " does not exists.");
    });
};

exports.insertYield = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.body.username;
    var parcels = JSON.parse(req.body.parcels);
    var password = req.body.password;
    var yield = JSON.parse(req.body.yield);


    var newYield = new Yield();
    newYield.date = yield.date;
    newYield.uploadingDate = yield.uploadingDate;
    newYield.yield = yield.yield;
    newYield.comments = yield.comments;

    User.findOne({'username': name}, function (err, user) {
        if (err){
            return res.status(500).send(err.message);
        }
        else if(user) {

            if(!isValidPassword(user, password))
                return res.status(200).send("Password Wrong.");
            var userParcelsArray = getParcelsArray(user.parcels);

            //Check if all parcels belongs to user
            for (var i = 0; i < parcels.length; i++) {
                if (!contains(userParcelsArray, parcels[i])) {
                    return res.status(200).send("Parcel " + parcels[i]+
                        " does not belong to " + user.username + ".");
                }
            }

            for (var i = 0; i < user.parcels.length; i++) {
                if (contains(parcels, user.parcels[i].parcelId)) {
                    console.log(newYield);
                    user.parcels[i].yields.push(newYield);
                }
            }
            user.save(function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                else {

                    return res.status(200).send("OK");
                }
            });
        }
        else return res.status(200).send("User " + name + " does not exists.");
    });
};

exports.insertIrrigationInfo = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.body.username;
    var parcels = JSON.parse(req.body.parcels);
    var password = req.body.password;
    var irrigationInfo = JSON.parse(req.body.irrigationInfo);


    var newIrrigationInfo = new IrrigationInfo();
    newIrrigationInfo.startDate = irrigationInfo.startDate;
    newIrrigationInfo.endDate = irrigationInfo.endDate;
    newIrrigationInfo.quantityOfWaterMeasure = irrigationInfo.quantityOfWaterMeasure;
    newIrrigationInfo.waterQuantity = irrigationInfo.waterQuantity;
    newIrrigationInfo.waterHours = irrigationInfo.waterHours;
    newIrrigationInfo.waterDepth = irrigationInfo.waterDepth;
    newIrrigationInfo.uploadingDate = irrigationInfo.uploadingDate;

    User.findOne({'username': name}, function (err, user) {
        if (err){
            return res.status(500).send(err.message);
        }
        else if(user) {

            if(!isValidPassword(user, password))
                return res.status(200).send("Password Wrong.");
            var userParcelsArray = getParcelsArray(user.parcels);

            //Check if all parcels belongs to user
            for (var i = 0; i < parcels.length; i++) {
                if (!contains(userParcelsArray, parcels[i])) {
                    return res.status(200).send("Parcel " + parcels[i]+
                        " does not belong to " + user.username + ".");
                }
            }

            for (var i = 0; i < user.parcels.length; i++) {
                if (contains(parcels, user.parcels[i].parcelId)) {
                    user.parcels[i].agrochemicals.push(newIrrigationInfo);
                }
            }
            user.save(function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                else {

                    return res.status(200).send("OK");
                }
            });
        }
        else return res.status(200).send("User " + name + " does not exists.");
    });
};

exports.insertFertilizer = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.body.username;
    var parcels = JSON.parse(req.body.parcels);
    var password = req.body.password;
    var fertilizer = JSON.parse(req.body.fertilizer);

    var newFertilizer = new Fertilizer();
    newFertilizer.date = fertilizer.date;
    newFertilizer.uploadingDate = fertilizer.uploadingDate;
    newFertilizer.product = fertilizer.product;
    newFertilizer.quantity = fertilizer.quantity;
    newFertilizer.nitrogenContent = fertilizer.nitrogenContent;
    newFertilizer.phosphorusContent = fertilizer.phosphorusContent;
    newFertilizer.potassiumContent = fertilizer.potassiumContent;

    User.findOne({'username': name}, function (err, user) {
        if (err){
            return res.status(500).send(err.message);
        }
        else if(user) {

            if(!isValidPassword(user, password))
                return res.status(200).send("Password Wrong.");
            var userParcelsArray = getParcelsArray(user.parcels);

            //Check if all parcels belongs to user
            for (var i = 0; i < parcels.length; i++) {
                if (!contains(userParcelsArray, parcels[i])) {
                    return res.status(200).send("Parcel " + parcels[i]+
                        " does not belong to " + user.username + ".");
                }
            }

            for (var i = 0; i < user.parcels.length; i++) {
                if (contains(parcels, user.parcels[i].parcelId)) {
                    user.parcels[i].fertilizers.push(newFertilizer);
                }
            }
            user.save(function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                else {

                    return res.status(200).send("OK");
                }
            });
        }
        else return res.status(200).send("User " + name + " does not exists.");
    });
};

exports.insertAgrochemical = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.body.username;
    var parcels = JSON.parse(req.body.parcels);
    var password = req.body.password;
    var agrochemical = JSON.parse(req.body.irrigation);

    var newAgrochemical = new Agrochemical();
    newAgrochemical.date = agrochemical.date;
    newAgrochemical.uploadingDate = agrochemical.uploadingDate;
    newAgrochemical.product = agrochemical.product;
    newAgrochemical.amount = agrochemical.amount;

    User.findOne({'username': name}, function (err, user) {
        if (err){
            return res.status(500).send(err.message);
        }
        else if(user) {

            if(!isValidPassword(user, password))
                return res.status(200).send("Password Wrong.");
            var userParcelsArray = getParcelsArray(user.parcels);

            //Check if all parcels belongs to user
            for (var i = 0; i < parcels.length; i++) {
                if (!contains(userParcelsArray, parcels[i])) {
                    return res.status(200).send("Parcel " + parcels[i]+
                        " does not belong to " + user.username + ".");
                }
            }

            for (var i = 0; i < user.parcels.length; i++) {
                if (contains(parcels, user.parcels[i].parcelId)) {
                    user.parcels[i].agrochemicals.push(newAgrochemical);
                }
            }
            user.save(function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                else {

                    return res.status(200).send("OK");
                }
            });
        }
        else return res.status(200).send("User " + name + " does not exists.");
    });
};

exports.insertPhenology = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.body.username;
    var parcels = JSON.parse(req.body.parcels);
    var password = req.body.password;
    var phenology = JSON.parse(req.body.phenology);

    var newPhenology = new Phenology();
    newPhenology.date = phenology.date;
    newPhenology.uploadingDate = phenology.uploadingDate;
    newPhenology.developmentStage = phenology.developmentStage;
    newPhenology.growthStage = phenology.growthStage;
    newPhenology.code = phenology.code;


    User.findOne({'username': name}, function (err, user) {
        if (err){
            return res.status(500).send(err.message);
        }
        else if(user) {

            if(!isValidPassword(user, password))
                return res.status(200).send("Password Wrong.");
            var userParcelsArray = getParcelsArray(user.parcels);

            //Check if all parcels belongs to user
            for (var i = 0; i < parcels.length; i++) {
                if (!contains(userParcelsArray, parcels[i])) {
                    return res.status(200).send("Parcel " + parcels[i]+
                        " does not belong to " + user.username + ".");
                }
            }

            for (var i = 0; i < user.parcels.length; i++) {
                if (contains(parcels, user.parcels[i].parcelId)) {
                    user.parcels[i].phenologies.push(newPhenology);
                }
            }
            user.save(function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                else {

                    return res.status(200).send("OK");
                }
            });
        }
        else return res.status(200).send("User " + name + " does not exists.");
    });
};

function isValidPassword(user, password) {
    return bCrypt.compareSync(password, user.password);
}

function stringToIntArray(stringArray){
    var intArray = [];
    for (var i = 0; i < stringArray.length; i++) {
        intArray.push(parseInt(stringArray[i]))
    }
    return intArray;
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] == obj) {
            return true;
        }
    }
    return false;
}

function getParcelsArray(parcelsJson){
    var parcelsArray = [];
    for (var i = 0; i < parcelsJson.length; i++) {
        parcelsArray.push(parcelsJson[i].parcelId);
    }
    return parcelsArray;
}