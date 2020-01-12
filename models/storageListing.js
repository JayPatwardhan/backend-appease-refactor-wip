const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const storageSchema = new mongoose.Schema({
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
    amountOfSpace: {type: Number, required: true, min: 0},
    pricePerDay: {type: Number, required: true, min: 0},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    latitude: {type: Number},
    longitude: {type: Number},
    distance: {type:Number, default: 0}

});

const storageListing = mongoose.model('StorageListing', storageSchema);

function validateStorage(storage){
    const schema = Joi.object({
        name: Joi.string().required(),
        houseNumber: Joi.string().required(),
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().required(),
        amountOfSpace: Joi.number().min(0).required(),
        pricePerDay: Joi.number().min(0).precision(2).required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required()
    });

    return schema.validate(storage);
}

module.exports.storageListing = storageListing;
module.exports.validateStorage = validateStorage;