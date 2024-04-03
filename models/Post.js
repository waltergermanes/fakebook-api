const { Schema, model, default: mongoose } = require("mongoose")

const postSchema = new Schema({
    postedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }, 
    desc: {
        type: String,
        required: true
    }, 
    bgcolor: {
        type: String,
    }, 
    img: {
        type: Array
    }, 
    likes: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})
module.exports = model("Post", postSchema)