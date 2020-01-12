const mongoose = require('mongoose');
const express = require('express');
const config = require('config');
const cors = require('cors');
const users = require('./routes/users');
const auth = require('./routes/auth');
const parkingListings = require('./routes/parkingListings');
const parkingBookings = require('./routes/parkingBookings');
const storageListings = require('./routes/storageListings');
const storageBookings= require('./routes/storageBookings');
const app = express();

if (!config.get('jwtPrivateKey')){
    console.error('FATAL ERROR: jwtPrivateKey is NOT defined');
    process.exit(1);
}

if(!config.get('myAPIKey')){
    console.error('FATAL ERROR: myAPIKey is NOT defined');
    process.exit(1);
}
// Connect to the db
mongoose.connect('mongodb://localhost/appease', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.log('Could not conenct to MongoDB...'));

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

//routes
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/parkingListings', parkingListings);
app.use('/api/parkingBookings', parkingBookings);
app.use('/api/storageListings', storageListings);
app.use('/api/storageBookings', storageBookings);

//listen
const port = process.env.PORT || 3000;
app.listen(3000, () => console.log(`Listening on port ${port}...`));