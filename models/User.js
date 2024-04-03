const { Schema, model } = require("mongoose")

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }, 
    firstName: {
        type: String,
        required: true
    }, 
    lastName: {
        type: String,
        required: true
    }, 
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ""
    }, 
    gender: {
        type: String,
        default: ``, 
    },
    isAdmin: {
        type: Boolean,
        default: false
    }, 
    profilePhoto: {
        type: String,
        default: ""
    },
    coverPhoto: {
        type: String,
        default: ""
    },
    followers:{
       type: Array,
       default: []
    },
    following: {
       type: Array,
       default: []
    },
    active: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: String 
}, {
    timestamps: true
})
module.exports = model("User", userSchema)