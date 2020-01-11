const mongoose = require('mongoose');
const express = require('express');
const{parkingListing, validateParking} = require('../models/parkingListing');
const auth = require('../middleware/auth');
const _ = require('lodash');
const openGeocoder = require('node-open-geocoder');
const router = express.Router();

//Post request to add a new parking spot to collection
router.post('/', auth, async(req,res) => {
    const {error} = validateParking(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    try{
        let listing = await parkingListing.findOne(
            {
                $and: [
                    {state: req.body.state},
                    {street: req.body.street},
                    {houseNumber: req.body.houseNumber},
                    {startDate: req.body.startDate},
                    {endDate: req.body.endDate},
                    {pricePerDay: req.body.pricePerDay}
                ]
            }
        );
        if(listing) return res.status(400).send('Posting at this location is already up. NOTE: you must group all spots with same price-per-day together in the same listing');

        listing = new parkingListing({
            name: req.body.name,
            user: req.user._id,
            houseNumber: req.body.houseNumber,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            numberOfSpots: req.body.numberOfSpots,
            pricePerDay: req.body.pricePerDay,
            startDate: req.body.startDate,
            endDate: req.body.endDate
        });

        await listing.save();
        return res.send(_.pick(listing, ['_id', 'name', 'numberOfSpots', 'houseNumber', 'city', 'state', 'startDate', 'endDate', 'pricePerDay']));
    }
    catch(err){
        return res.send(err.message);
    }
});

//put request to update listing
router.put('/:id', auth, async(req,res) => {
    try{
        const listing = await parkingListing.findOne({_id: req.params.id});
        if(!listing) return res.status(404).send('Listing not found');

        //make sure user is in fact updating their own listing and not someine else's
        if(req.user._id.toString() === listing.user.toString()){
            //if these things pass, then now go ahead and update
                const updateObject = req.body;
                await parkingListing.updateOne({_id: req.params.id}, {$set: updateObject});
                return res.send('Listing updated succesfully');
        }
        else{
            return res.status(400).send('Cannot update a listing that is not yours');
        }
    }
    catch(err){
        return res.send(err);
    }
});

module.exports = router;