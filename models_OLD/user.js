//This model represents the Schema of the User. (users) collection.

var mongoose = require("mongoose");
//var LastPosition = mongoose.model("LastPosition");
//var LastPositionSchema = LastPosition.schema;
var Parcel = mongoose.model("Parcel");
var ParcelSchema = Parcel.schema;

var User = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    region: String,
    profile: String,
    language: String,
    activeAccount: Boolean,
    lastPosition:{
        lastX: Number,
        lastY: Number,
        zoom: Number,
        spatialReference: String
    },
    parcels: [ParcelSchema]
    });

module.exports = mongoose.model('User', User);

//module.exports = mongoose.model("User",{
//    username: String,
//    password: String,
//    email: String,
//    parcels: [
//        {
//            parcelId: Number,
//            soils:[
//                {
//                    kind: String,
//                    organicMatter: Number,
//                    ph: Number,
//                    updateDate: Date
//                }
//            ]
//        }
//        ]
//    }
//);