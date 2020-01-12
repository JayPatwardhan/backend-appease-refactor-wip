const mongoose = require('mongoose');
const express = require('express');
const {storageListing, validateStorage} = require('../models/storageListing');
const auth = require('../middleware/auth');
const _ =require('lodash');
const NodeGeocoder= require('node-geocoder');
const geolib = require('geolib');
const Math = require('mathjs');
const config = require('config');
const router = express.Router();

router.post('/', auth, async (req,res) => {
    const {error} = validateStorage(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    try{
        const listing = await storageListing.findOne(
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
        if(listing) return res.status(400).send('The listing is already up');

        const options={
            provider: 'google',
            httpAdapter: 'https',
            apiKey: config.get('myAPIKey'),
            formatter: null
        }

        const geocoder = NodeGeocoder(options);

        var location= await geocoder.geocode(req.body.housenumber + req.body.street + req.body.city + req.body.state + req.body.zip, function(err,ress){
            return ress;
        });

        storeThis = new storageListing({
            name: req.body.name,
            user: req.user._id,
            houseNumber: req.body.houseNumber,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            amountOfSpace: req.body.amountOfSpace,
            pricePerDay: req.body.pricePerDay,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            latitude: location[0].latitude,
            longitude: location[0].longitude
        });

        await storeThis.save();
        return res.send(storeThis);
    }
    catch(err){
        return res.send(err.message);
    }
});

router.put('/:id', auth, async(req,res) => {
    try{
        const listing = await storageListing.findOne({_id: req.params.id});
        if(!listing) return res.status(400).send('Listing you are looking for not found');

        if(req.user._id.toString() === listing.user.toString()){
            const updateObject = req.body;
            await storageListing.updateOne({_id: req.params.id}, {$set: updateObject});
            return res.send('Listing updated succesfully');
        }
        else{
            return res.status(400).send('Cannot update a listing that is not yours');
        }
    }
    catch(err){
        return res.send(err.message);
    }
});



router.post('/getlistings', async (req,res) => {
    const options = {
        provider: 'google',
        httpAdapter: 'https',
        apiKey: config.get('myAPIKey'),
        formatter: null
    }
    const geocoder = NodeGeocoder(options);

    try{
        const location = await geocoder.geocode(req.body.address, function(err,ress){
            return ress;
        });

        const array = await storageListing.find();
        for(i=0; i<array.length;i++){
            array[i].distance = Math.sqrt((array[i].latitude - location[0].latitude)*(array[i].latitude - location[0].latitude) + (array[i].longitude - location[0].longitude)*(array[i].longitude - location[0].longitude));
        };

        array.sort((a,b) => (a.distance > b.distance) ? 1 : -1);
        return res.send(array);

    }
    catch(err){
        return res.send(err);
    }
});

module.exports = router;