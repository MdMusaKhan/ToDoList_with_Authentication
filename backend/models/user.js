const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Creating a schema for the user
const userSchema = new mongoose.schema({

    username: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        max: 255,
        min: 6
    },
    password: { type: String, required: true, max: 1024, min: 6}

})

// Hashing the password before saving it to the database

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// Creating a model for the user
const User = mongoose.model('User', userSchema);