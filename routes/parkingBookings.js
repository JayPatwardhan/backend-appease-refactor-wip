const {parkingBooking, validateBooking} = require('../models/parkingBooking');
const {parkingListing, validateParking} = require('../models/parkingListing');
const {ObjectId} = require('mongodb');
const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const geodist = require('geodist');
const NodeGeocoder = require('node-geocoder');
const router = express.Router();

//post request to post a new listing
router.post('/:id', auth, async(req,res) => {
    const {error} = validateBooking(req.body);
    if(error) return res.status(400).send('Invalid Input');

    try{
        const found = await parkingListing.findOne({_id: ObjectId(req.params.id)});
        if(!found) return res.status(404).send('Listing not found');
        let e = new Date(req.body.endDate);
        let s = new Date(req.body.startDate);
        //make sure the booking's start and end dates are valid
        if((e.getTime() > found.endDate.getTime()) || (s.getTime() < found.startDate.getTime()))
            return res.status(400).send('Make sure the dates for your booking fall in the dates that the listing is up');
        //calculate days between end annd start date
        const days = (e.getTime() - s.getTime()) / (1000*3600*24);
        //calculate price
        let price = 0;
        if(days === 0)
            price = found.pricePerDay;
        else{
            price = days * found.pricePerDay;
        }
        const p = price;
        //return res.send({p: price});
        const booking = new parkingBooking({
            userId: req.user._id,
            parkingListingId: ObjectId(req.params.id),
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            totalPrice: price
        });

        await booking.save();
        //decrement number of spots in that listing by 1
        const sub = found.numberOfSpots - 1;
        await parkingListing.findOneAndUpdate({_id: ObjectId(req.params.id)}, {numberOfSpots: sub});
        return res.send(booking);
    }
    catch(err){
        return res.send(err.message);
    }
});

module.exports = router;