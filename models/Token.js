const { Schema, model } = require("mongoose")

const TokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
       },
    token: {
        type: String,
        required: true
    }
}, {timestamps: true});

TokenSchema.index({createdAt: 1},{expireAfterSeconds: 3600}) //1hr
module.exports = model("Token", TokenSchema)