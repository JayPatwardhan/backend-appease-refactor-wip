const express = require('express');
const router = express.Router();
const {storageListing, validateStorage} = require('../models/storageListing');
const auth = require('../middleware/auth');

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

        const storeThis = new storageListing({
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
        const listing = storageListing.findOne({_id: req.params.id});
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

module.exports = router;