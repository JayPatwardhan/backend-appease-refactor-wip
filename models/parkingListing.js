const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

//create a new schema for geolocation, to use when we want to find addresses nearby a certain distance
const geoSchema = new mongoose.Schema({
    type: {
        type: String,
        default: "Point"
    },
    coordinates: {
        type: [Number],
        index: "2dsphere"
    }
});

//create the parkingListing template
const parkingSchema = new mongoose.Schema({
    name: {type: String, required: true},
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    houseNumber: {type: String, required: true},
    street: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zip: {type: String, required: true},
    numberOfSpots: {type: Number, required: true, min: 0},
    pricePerDay: {type: Number, required: true, min: 0},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    latitude: {type: Number},
    longitude: {type: Number},
    distance: {type: Number, default: 0}
    //geometry: geoSchema
});

const parkingListing = mongoose.model('ParkingListing', parkingSchema);

//Joi validation 
function validateParking(parking){
    const schema = Joi.object({
        name: Joi.string().required(),
        houseNumber: Joi.string().required(),
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().required(),
        numberOfSpots: Joi.number().min(0).required(),
        pricePerDay: Joi.number().min(0).precision(2).required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required()
    });

    return schema.validate(parking);
}

module.exports.parkingListing = parkingListing;
module.exports.validateParking = validateParking;