const {storageBooking, validateStorageBooking}=require('../models/storageBooking');
const{storageListing, validateStorage}=require('../models/storageListing');
const{ObjectId}=require('mongodb'); 
const auth=require('../middleware/auth');
const express=require('express');
const mongoose=require('mongoose');
const geodist=require('geodist');
const NodeGeocoder=require('node-geocoder');
const router=express.Router();


router.post('/:id', auth, async(req,res)=>{
    const {error}=validateStorageBooking(req.body);
    if(error) return res.status(400).send("Invalid Input");

    try{
        const found=await storageListing.findOne({_id: ObjectId(req.params.id)});
        if(!found) return res.status(400).send('Listing not found');
        let e=new Date(req.body.endDate);
        let s=new Date(req.body.startDate);

        if((e.getTime()>found.endDate.getTime()) || (s.getTime()<found.startDate.getTime()))
            return res.status(400).send("Make sure the dates for your booking fall in the dates that the listing is up");

        const days=(e.getTime()-s.getTime())/(1000*3600*24);

        let price=0;
        if(days===0)
            price=found.pricePerDay;
        else{
            price=days*found.pricePerDay;
        }
        const p=price;

        const booking=new storageBooking({
            userId: req.user._id,
            storageListingId: ObjectId(req.params.id),
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            totalPrice: price
        });

        await booking.save();

        const sub=found.numberOfSpots-1;
        await storageListing.findOneAndUpdate({_id: ObjectId(req.params.id)}, {numberOfSpots: sub});
        return res.send(booking);
    }
    catch(err){
        return res.send(err.message);
    }
});

module.exports=router;