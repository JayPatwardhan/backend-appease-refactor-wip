const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const storageBookingSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    storageListingId: {
        type: mongoose.Schema.ObjectId,
        ref: 'storageListing',
        required: true
    },
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    totalPrice: {type: Number, required: true}
});

const storageBooking = mongoose.model('StorageBooking', storageBookingSchema);

function validateStorageBooking(booking){
    const schema = Joi.object({
        startDate: Joi.date().required(),
        endDate: Joi.date().required()
    });

    return schema.validate(booking);
}

module.exports.storageBooking = storageBooking;
module.exports.validateStorageBooking = validateStorageBooking;