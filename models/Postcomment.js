const { Schema, model } = require("mongoose")

const postcommentSchema = new Schema({
    postId: {
        type:  Schema.Types.ObjectId,
        ref: "Post"
    }, 
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }, 
    comment: {
        type: String,
        required: true
    }, 
    likes: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})
module.exports = model("Postcomment", postcommentSchema)