const {User} = require('../models/user');
const Joi = require('@hapi/Joi');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const router = express.Router();

//validation function for login
function validateLogin(log){
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().min(8).required()
    });

    return schema.validate(log);
}
//authentication post request
router.post('/', async(req,res)=>{
    //validate login
    const {error} = validateLogin(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    try{
        //Check if email is valid
        const user = await User.findOne({email: req.body.email});
        if(!user) return res.status(400).send('Invalid email or password');
        //check password
        const checkPass = await bcrypt.compare(req.body.password, user.password);
        if(!checkPass) return res.status(400).send('Invalid email or password');
        //if all this passes, login is valid and get a json web token for user
        const token = user.generateAuthToken();
        return res.send(token);
    }
    catch(err){
        return res.send(err.message);
    }
});

module.exports = router;
