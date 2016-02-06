//This model represents the Schema of the Parcel. (parcels) collection.

var mongoose = require("mongoose");
var Soil = mongoose.model("Soil");
var SoilSchema = Soil.schema;
var ParcelStatus = mongoose.model("ParcelStatus");
var ParcelStatusSchema = ParcelStatus.schema;
var CropInfo = mongoose.model("CropInfo");
var CropInfoSchema = CropInfo.schema;
var Yield = mongoose.model("Yield");
var YieldSchema = Yield.schema;
var IrrigationInfo = mongoose.model("IrrigationInfo");
var IrrigationInfoSchema = IrrigationInfo.schema;
var Fertilizer = mongoose.model("Fertilizer");
var FertilizerSchema = Fertilizer.schema;
var Agrochemical = mongoose.model("Agrochemical");
var AgrochemicalSchema = Agrochemical.schema;
var Phenology = mongoose.model("Phenology");
var PhenologySchema = Phenology.schema;
var Pathogen = mongoose.model("Pathogen");
var PathogenSchema = Pathogen.schema;
var Disease = mongoose.model("Disease");
var DiseaseSchema = Disease.schema;
var Weed = mongoose.model("Weed");
var WeedSchema = Disease.schema;
var Observation = mongoose.model("Observation");
var ObservationSchema = Observation.schema;

var Parcel = new mongoose.Schema({
    parcelId: String,
    soils:[SoilSchema],
    parcelStatus:[ParcelStatusSchema],
    cropInfos:[CropInfoSchema],
    yields: [YieldSchema],
    irrigationInfos: [IrrigationInfoSchema],
    fertilizers: [FertilizerSchema],
    agrochemicals: [AgrochemicalSchema],
    phenologies: [PhenologySchema],
    phatogens: [PathogenSchema],
    diseases: [DiseaseSchema],
    weeds: [WeedSchema],
    observations: [ObservationSchema]
});

module.exports = mongoose.model("Parcel", Parcel);