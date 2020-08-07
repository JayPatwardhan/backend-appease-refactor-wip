const {User, validateUser} = require('../models/user');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const express  = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const router = express.Router();

//get current user
router.get('/me', auth, async (req,res) => {
    try{
        const user = await User.findById(req.user._id);
        return res.send(user);
    }
    catch(err){
        return res.send(err.message);
    }
});

//post method to create new user
router.post('/', async (req, res) => {
    //validate request
    const {error} = validateUser(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    try{
        let user = await User.findOne({email: req.body.email});
        if(user) return res.send('User email already registered: try different email');

        //if user is unique, create user
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        //hash the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        await user.save();
        //return res.send(_.pick(user, ['_id', 'name', 'email']));
        return res.send('success')
    }
    catch(err){
        return res.send(err.message);
    }
});

module.exports = router;