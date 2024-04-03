const User = require("../models/User")
const bcrypt = require("bcrypt")
const asynchandler = require("express-async-handler")
const Post = require("../models/Post")
const Conversation = require("../models/Conversation")

const getUser = asynchandler(async(req, res)=>{
   const userId = req.query.userId
   const email = req.query.email
   
   const userFound = userId ? await User.findById(userId) : await User.findOne({email})
   const userPosts = await Post.find({ postedBy: userFound._id })

   const { password, updatedAt, refreshToken, ...other } = userFound._doc

   const userPosImgs = userPosts.map(post=> {
      return post.img.flat()
    })

   if (userFound) {
       return res.status(200).json({...other, userPosts: userPosImgs.flat()})
   }
})

const getUserFollowers = asynchandler(async(req, res)=>{
  const { id } = req.params
   const user = await User.findById(id)
  
   const userFollowers = await Promise.all(
    user.followers.map(async(id)=>{
        const follower = await User.findById(id)
        const { _id, firstName, lastName, profilePhoto } = follower._doc
        return {  _id, firstName, lastName, profilePhoto}
    })
   )
   res.status(200).json(userFollowers)
})
const getUserFollowing = asynchandler(async(req, res)=>{
    const { id } = req.params
     const user = await User.findById(id)
     const userFollowing = await Promise.all(
      user.following.map(async(id)=>{
          const following = await User.findById(id)
          const { _id, firstName, lastName, profilePhoto } = following._doc
          return {  _id, firstName, lastName, profilePhoto}
      })
     )
     res.status(200).json(userFollowing)
  })
 const getSuggestionUsers = asynchandler(async(req, res)=>{
    const userId = req.params.id
    const allUsers = await User.find()
    const userFound = await User.findOne({ _id: userId }) 
    const userFollowing = userFound.following
  
    const suggestionUsers = allUsers.filter(user=> !userFollowing.includes(user._id))
    if (allUsers && userFound) {
        return res.status(200).json(suggestionUsers)
    }
 })
const updateUser = asynchandler(async(req, res)=>{
    const { id } = req.params
     if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10) 
       }
       const user = await User.findByIdAndUpdate(id, { $set: req.body })
       if (user) {
        return res.status(200).json({ message: "User info has been update successfully" })
       } else {
        return res.status(403).json({ message: "Something went wrong" })
       } 
      // return res.status(403).json({  message: "You can only update your Account"})
    
})

const followUser = asynchandler(async(req, res)=>{
    const { id } = req.params
    if (req.body.userId !== id) {
        const user = await User.findById(id)
        const currentUser = await User.findById(req.body.userId)
        if (!user.followers.includes(req.body.userId)) {
            await user.updateOne({ $push: { followers: req.body.userId }})
            await currentUser.updateOne({ $push: { following: id }})
           
            res.status(200).json({ message: "User followed successfully"})
        } else if (user.followers.includes(req.body.userId)) {
            await user.updateOne({ $pull: { followers: req.body.userId }})
            await currentUser.updateOne({ $pull: { following: id }})
            res.status(200).json({ message: "User unfollowed successfully"})
        }
           
         const currentUserInfo = await User.findById(req.body.userId) // fetch the current User after follow and unfollow
       /* const allConvo = await Conversation.find() // select all conversation
        const isConvoExist = allConvo.find((item) =>{ 
           return JSON.stringify(item.members) === JSON.stringify([req.body.userId, id])
        })//check if convo already exists
         */
        const convos = await Conversation.find({
            members: { $in: [ req.params.userId, id ] }
        })//check if convo already exists
       
         if(!convos){
            if(currentUserInfo.followers.includes(id) && currentUserInfo.following.includes(id)){
                const newConvo = new Conversation({ members: [req.body.userId, id] })
                const saveConvo = await newConvo.save()
            }
        } 
       
     } else {
         res.status(403).json({  message: "You cant follow your Account"})
     }
})

const unFollowUser = asynchandler(async(req, res)=>{
    const { id } = req.params
    if (req.body.userId !== id) {
        const user = await User.findById(id)
        const currentUser = await User.findById(req.body.userId)
        if (user.followers.includes(req.body.userId)) {
            await user.updateOne({ $pull: { followers: req.body.userId }})
            await currentUser.updateOne({ $pull: { following: id }})
            res.status(200).json({ message: "User unfollowed successfully"})
        } else {
          res.status(403).json({ message: "You already unfollow this user" })
        }
     } else {
         res.status(403).json({  message: "You cant unfollow your Account"})
     }
})

const getUserSearch = asynchandler(async(req, res)=>{
    const { query } = req.query
   
    const results = await User.aggregate([
        {
            $match: {
              $or: [
                { firstName: { $regex: query, $options: 'i' } }, // Case-insensitive regex match for firstname
                { lastName: { $regex: query, $options: 'i' } }   // Case-insensitive regex match for lastname
              ]
            }
          },
          { $limit: 10 }, // Apply limit to the number of results
          { 
            $project: { 
              _id: 1, // include _id field
              firstName: 1, // Include firstname field
              lastName: 1, // Include lastname field
              profilePhoto: 1
            }
          }
        ])
 
    if(results){
        res.status(200).json(results)
    }else{
        res.status(500).json({ message: `error` })
    }
})
module.exports = { getUser, getSuggestionUsers, getUserFollowers, getUserFollowing, updateUser, followUser, unFollowUser, getUserSearch } 