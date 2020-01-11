const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const parkingBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    parkingListingId: {
        type: mongoose.Schema.ObjectId,
        ref: 'parkingListing',
        required: true
    },
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    totalPrice: {type: Number, required: true}
});

const parkingBooking = mongoose.model('parkingBooking', parkingBookingSchema);

function validateBooking(booking){
    const schema = Joi.object({
        startDate: Joi.date().required(),
        endDate: Joi.date().required()
    });

    return schema.validate(booking);
}

module.exports.parkingBooking = parkingBooking;
module.exports.validateBooking = validateBooking;