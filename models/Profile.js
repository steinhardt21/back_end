const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    
    User:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    City_Living:
    {
        type: String
    },
    Biography:
    {
        type: String
    },
    Date_Of_Birth:
    {
        type: Date
    },
    Position:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Position',
        default: null
    },
    Completed:
    {
        type: Boolean,
        default: true
    },
    Skills:
    {
        type: [String],
        default: null
    },
    Telephone:
    {
        type: String,
        default:null
    }
    ,
    Date_Inserted:
    {
        type: Date,
        default: Date.now
    }
})

module.exports = Profile = mongoose.model('Profile', ProfileSchema)