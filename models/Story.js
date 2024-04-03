const { Schema, model } = require("mongoose")

const storySchema = new Schema({
   userID:{
    type: Schema.Types.ObjectId,
    ref: "User"
   },
   url:{
     type: String
   },
   type: {
    type: String
   },
   viewers: {
    type: Array,
    default: []
   },
   isActive: {
    type: Boolean,
    default: true
   }
}, {
    timestamps: true
})
module.exports = model("Story", storySchema)