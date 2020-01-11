const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const config = require('config');

//create the user template
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minlength: 8,
        maxlength: 1024
    }
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id}, config.get('jwtPrivateKey'), {expiresIn: '1d'});
    return token;
}

const User = mongoose.model('User', userSchema);

//helper functions
function validateUser(user){
    const schema = Joi.object({
        name: Joi.string().max(50).required(),
        email: Joi.string().required().email(),
        password: Joi.string().min(8).required()
    });

    return schema.validate(user);
}

//exports
exports.User = User;
exports.validateUser = validateUser;