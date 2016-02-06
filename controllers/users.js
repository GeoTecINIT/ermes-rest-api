//This controller contains the code of the USER REST services.
//It recieves the petition and the params and makes the operations.
//It is using the "User" model, so the operations will be stored in the "users" collection.
//Mongoose makes this automatically in a smart Way.

var mongoose = require("mongoose");
var User = mongoose.model("User");
var LastPosition = mongoose.model("LastPosition");
var Parcel = mongoose.model("Parcel");
var Soil = mongoose.model("Soil");
var response = null;
var bCrypt = require('bcrypt-nodejs');
//GET -  Return all users in DataBase
exports.findAllUsers = function(req, res){
    User.find(function(err, users){
        if(err) return res.send(500, err.message);
        res.status(200).jsonp(users);
    });
};

exports.findLastModifiedFields = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.params.username;


    User.findOne({'username': name}, { _id: 0, username: 1, email: 1, parcels: 1 , region: 1, lastPosition: 1, profile: 1}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (user) {
            var responseText= '{"user": "' + user.username + '", "parcels": [';
            var userParcels = user.parcels;
            for(var j = 0; j < userParcels.length; j++) {
                responseText+='{"parcelId": "' + userParcels[j].parcelId + '"'

                //AGROCHEMICAL
                if(userParcels[j].agrochemicals.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].agrochemicals.length; i++) {
                        dates.push(userParcels[j].agrochemicals[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);
                    responseText+=',"agrochemicals": "' + lastDate + '"';
                }
                else responseText+=',"agrochemicals": ' + null;

                //CROP INFO
                if(userParcels[j].cropInfos.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].cropInfos.length; i++) {
                        dates.push(userParcels[j].cropInfos[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);

                    for(var i = 0; i < userParcels[j].cropInfos.length; i++) {
                        //console.log("Lo del server: " + userParcels[j].cropInfos[i].uploadingDate.toString());
                        //console.log("LAST DATE: " + lastDate.toString());
                        if(userParcels[j].cropInfos[i].uploadingDate && userParcels[j].cropInfos[i].uploadingDate.toString()==lastDate.toString()){
                            //console.log("Dentro del IF");
                            responseText+=',"cropType": "' + userParcels[j].cropInfos[i].cropType + '"';
                            responseText+=',"riceVariety": "' + userParcels[j].cropInfos[i].riceVariety + '"';
                        }
                    }
                    //responseText+=',"cropInfos": "' + lastDate + '"';
                }
                else{
                    responseText+=',"cropType": ' + null;
                    responseText+=',"riceVariety": ' + null;
                }

                //DISEASE
                if(userParcels[j].diseases.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].diseases.length; i++) {
                        dates.push(userParcels[j].diseases[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);
                    responseText+=',"diseases": "' + lastDate + '"';
                }
                else responseText+=',"diseases": ' + null;

                //FERTILIZER
                if(userParcels[j].fertilizers.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].fertilizers.length; i++) {
                        dates.push(userParcels[j].fertilizers[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);
                    responseText+=',"fertilizers": "' + lastDate + '"';
                }
                else responseText+=',"fertilizers": ' + null;

                //IRRIGATION INFO
                if(userParcels[j].agrochemicals.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].agrochemicals.length; i++) {
                        dates.push(userParcels[j].agrochemicals[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);
                    responseText+=',"irrigationInfo": "' + lastDate + '"';
                }
                else responseText+=',"irrigationInfo": ' + null;

                //OBSERVATION
                if(userParcels[j].observations.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].observations.length; i++) {
                        dates.push(userParcels[j].observations[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);
                    responseText+=',"observations": "' + lastDate + '"';
                }
                else responseText+=',"observations": ' + null;

                //PARCEL STATUS
                if(userParcels[j].parcelStatus.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].parcelStatus.length; i++) {
                        dates.push(userParcels[j].parcelStatus[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);
                    responseText+=',"parcelStatus": "' + lastDate + '"';
                }
                else responseText+=',"parcelStatus": ' + null;

                //PATHOGEN
                if(userParcels[j].phatogens.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].phatogens.length; i++) {
                        dates.push(userParcels[j].phatogens[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);
                    responseText+=',"phatogens": "' + lastDate + '"';
                }
                else responseText+=',"phatogens": ' + null;

                //PHENOLOGY
                if(userParcels[j].phenologies.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].phenologies.length; i++) {
                        dates.push(userParcels[j].phenologies[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);
                    responseText+=',"phenologies": "' + lastDate + '"';
                }
                else responseText+=',"phenologies": ' + null;

                //SOIL
                if(userParcels[j].soils.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].soils.length; i++) {
                        dates.push(userParcels[j].soils[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);
                    responseText+=',"soils": "' + lastDate + '"';
                }
                else responseText+=',"soils": ' + null;

                //WEED
                if(userParcels[j].weeds.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].weeds.length; i++) {
                        dates.push(userParcels[j].weeds[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);
                    responseText+=',"weeds": "' + lastDate + '"';
                }
                else responseText+=',"weeds": ' + null;

                //YIELD
                if(userParcels[j].yields.length>0){
                    var dates = [];
                    for(var i = 0; i < userParcels[j].yields.length; i++) {
                        dates.push(userParcels[j].yields[i].uploadingDate);
                    }
                    var lastDate = Math.max.apply(null, dates);
                    lastDate = new Date(lastDate);
                    responseText+=',"yields": "' + lastDate + '"';
                }
                else responseText+=',"yields": ' + null;

                responseText+="}";
                if(j<userParcels.length-1) responseText+=",";

            }
            responseText+="]}";
            var responseJson = JSON.parse(responseText);
            res.status(200).jsonp(responseJson);
        }
        else {
            res.status(200).jsonp("User " + name + " does not exists.");
        }
    });
};

exports.insertLastPosition = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.body.username;
    var password = req.body.password;
    var position = JSON.parse(req.body.position);

    User.findOne({'username': name}, function (err, user) {
        if (err){
            return res.status(500).send(err.message);
        }
        else if(user) {
            if(!isValidPassword(user, password))
                return res.status(200).send("Password Wrong.");
            console.log(user);
            user.lastPosition.lastX = position.lastX;
            user.lastPosition.lastY = position.lastY;
            user.lastPosition.zoom = position.zoom;
            user.lastPosition.spatialReference = position.spatialReference;
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

exports.findUserByName = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.params.username;
    User.findOne({'username': name}, { _id: 0, username: 1, email: 1, parcels: 1 , region: 1, profile: 1}, function (err, user) {

        if (err) return res.send(500, err.message);
        if (user) {
            res.status(200).jsonp(user);
        }
        else {
            res.status(200).jsonp("User " + name + " does not exists.");
        }
    });
};

exports.findParcelByUserAndId = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.body.username;
    var id = req.body.parcelid;
    var password = req.body.password;
    //console.log("LLega");
    //User.findOne({'username': name}, function (err, user) {
    //    console.log(name);
    //    console.log(id);
    //    console.log(password);
    //    if (err){
    //        return res.status(500).send(err.message);
    //    }
    //    else if(user) {
    //        if (!isValidPassword(user, password))
    //            return res.status(500).send("You are not allowed to see this info.");
    //    }
    //});

    //User.findOne({'username': name, 'parcels.parcelId': id}, {'parcels.*.file': 0}, function (err, user) {
    User.findOne({'username': name, 'parcels.parcelId': id}, {'parcels.$': 1}, function (err, user) {
        //console.log(name);
        //console.log(id);
        //console.log(password);
        //console.log(user);

        if (err){
            console.log(err);
            return res.status(500).send(err.message);
        }
        else if (user) {
            var result =  JSON.parse(JSON.stringify(user, function(key, value) {
                return key !== 'file' ? value : true;
            }));

            return res.status(200).jsonp(result);
            //return res.status(200).jsonp(user);
        }
        else {
            return res.status(200).jsonp({message : "This parcel has no info."});
        }
    });
};

exports.findShortUserByName = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.params.username;
    User.findOne({'username': name}, { _id: 0, username: 1, email: 1, parcels: 1 , region: 1, lastPosition: 1, profile: 1}, function (err, user) {
        if (err) return res.send(500, err.message);



        if (user) {
            var responseParcels = [];
            var userParcels = user.parcels;
            for(var j = 0; j < userParcels.length; j++) {
                responseParcels.push(userParcels[j].parcelId);
            }
            //console.log("RESPONSE PARCELS NORMAL: " + responseParcels);

            //responseParcelsString = responseParcels.toString();
            //console.log("RESPONSE PARCELS STRING: " + responseParcelsString);
            var responseText= '{"user": "' + user.username +
                '", "email": "' + user.email +
                '", "region": "' + user.region +
                '", "profile": "' + user.profile +
                '", "lastPosition": ' +
                '{"spatialReference": "' + user.lastPosition.spatialReference +
                '", "lastX": "' + user.lastPosition.lastX +
                '", "lastY": "' + user.lastPosition.lastY +
                '", "zoom": "' + user.lastPosition.zoom + '"}' +
                ', "parcels": "'+ responseParcels + '"}';


            //return response.status(200).send(responseJson);
            //console.log("RESPONSE_JSON: " + responseText);
            var responseJson = JSON.parse(responseText);
            res.status(200).jsonp(responseJson);
        }
        else {
            res.status(200).jsonp("User " + name + " does not exists.");
        }
    });
};

exports.insertParcelsInUser = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var name = req.body.username;
    response = res;
    User.findOne({'username': name}, function (err, user) {
        if (err){
            return res.status(500).send(err.message);
        }
        else if (user) {
			if(req.body.parcels!=undefined)
				var newParcels = req.body.parcels;
			else var newParcels = [];

            if(!isValidPassword(user, req.body.password)){

                return res.status(200).send("Password Wrong.");
            }

            getUsedParcels(user, newParcels);
        }
        else {
            return res.status(200).send("User " + name + " does not exists.");
        }
    });
};

function getUsedParcels(user, newPacels){

    User.find({},{"_id": 0, "parcels.parcelId": 1}, function(err, parcels){
        var totalOwnedParcels = [];
        for(var i = 0; i < parcels.length; i++) {

            var userParcels = parcels[i].parcels;

            for(var j = 0; j < userParcels.length; j++) {
               totalOwnedParcels.push(userParcels[j].parcelId);
            }
        }
        getPreviousUserParcels(user, totalOwnedParcels, newPacels);
    });
}

function getPreviousUserParcels(user, totalOwnedParcels, newPacels){

    User.findOne({username: user.username}, function(err, user){
        var previousOwnedParcels = [];
            var userParcels = user.parcels;
            for(var j = 0; j < userParcels.length; j++) {
                    previousOwnedParcels.push(userParcels[j].parcelId);
            }
        differenceBetweenArrays(totalOwnedParcels, previousOwnedParcels, user, newPacels);
    });
}

function differenceBetweenArrays(totalOwnedParcels, previousOwnedParcels, user, newPacels){
    var difference = []

    for(var i=0;i<totalOwnedParcels.length;i++){

        if(!contains(previousOwnedParcels,totalOwnedParcels[i])){

            difference.push(totalOwnedParcels[i]);
        }
    }

    updateUserParcels(user, difference, newPacels, previousOwnedParcels);
}

function updateUserParcels(user, usedParcels, newParcels, previousOwnedParcels){


    //UNCOMMENT TO CHECK IF USER SELECT PARCEL OWNED BY OTHERS
    //for(var i = 0; i < newParcels.length; i++){
    //    if(contains(usedParcels, newParcels[i])){
    //        response.status(200).send("ParcelsUsed");
    //        return;
    //    }
    //}
	
    //user.parcels = [];

    console.log("ANTES: " + user.parcels.length);
    for(var i = 0; i < newParcels.length; i++){

        if(!contains(previousOwnedParcels, newParcels[i])) {

            console.log("A�ADE: " + newParcels[i]);
            var p = newParcels[i];
            var newParcel = new Parcel();
            newParcel.parcelId = p;
            user.parcels.push(newParcel);
        }
    }

    console.log("A�ADIDAS: " + user.parcels.length);

    for(var i = 0; i < previousOwnedParcels.length; i++){
        if(!contains(newParcels, previousOwnedParcels[i])) {
            user.parcels.forEach(function(parcel, index){
                //console.log("PARCELID: " + parcel.parcelId );
                //console.log("PREVIOUS OWNED: " + previousOwnedParcels[i] );
                if(parcel.parcelId==previousOwnedParcels[i]) {
                    //console.log("PARCELA A ELIMINAR: " + parcel);
                    user.parcels.remove(parcel);
                }
            })

        }
    }
    console.log("DESPUES: " + user.parcels.length);

    user.save(function (err) {
        if (err){
            return response.status(500).send(err.message);
        }
        else{
            var responseText= '{"user": "' + user.username +
                '", "email": "' + user.email + '"}';
            var responseJson = JSON.parse(responseText);
            return response.status(200).jsonp(responseJson);
        }
    });
}

function isValidPassword(user, password) {
    return bCrypt.compareSync(password, user.password);
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] == obj) {
            return true;
        }
    }
    return false;
}

function remove(array, value) {
    var index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
    }
}

function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
}
