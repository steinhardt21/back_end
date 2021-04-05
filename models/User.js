const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    Name: {
        type: String,
        require: true
    },
    Surname: {
        type: String,
        require: true
    },
    Email:
    {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    Date: {
        type: Date,
        default: Date.now
    }
})

module.exports = User = mongoose.model('User', UserSchema)