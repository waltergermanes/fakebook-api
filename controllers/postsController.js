const Post = require("../models/Post")
const asynchandler = require("express-async-handler")
const User = require("../models/User")
const Postcomment = require("../models/Postcomment")


const getPost = asynchandler(async(req, res)=>{
    const post = await Post.findOne({ _id: req.params.id})
    if (post) {
        res.status(200).json(post)
    }else{
        res.status(401).json({ message: "Something went wrong" })
    }
})

const getLikePosts = asynchandler(async(req, res)=>{
    const likePosts = await Post.find({ likes: { $in: [ req.params.id ] } }).populate({ path: `postedBy`, select: `firstName lastName profilePhoto` })
  
    if (likePosts) {
        res.status(200).json(likePosts)
    }else{
        res.status(401).json({ message: "Something went wrong" })
    }
})

const getCommentPosts = asynchandler(async(req, res)=>{
    const commentPosts = await Postcomment.find({ userId:  req.params.id })
    .populate({ path: `postId`, populate:{
        path: `postedBy`, select: `firstName lastName profilePhoto`
    } })
    if (commentPosts) {
        res.status(200).json(commentPosts)
    }else{
        res.status(401).json({ message: "Something went wrong" })
    }
})

const createPost = asynchandler(async(req, res)=>{
    const newPost = new Post(req.body)
    const savePost = await newPost.save()
    if (savePost) {
        res.status(200).json(savePost)
    }else{
        res.status(401).json({ message: "Something went wrong" })
    }
})

const getfriendsPosts = asynchandler(async(req, res)=>{
    const { page } = req.query || 0
    const pageLimit = 3
    const startIndex = (Number(page)-1) * pageLimit
     
    const currentUser = await User.findById(req.params.id)
    const userPosts = await Post.find({ postedBy: currentUser._id }).populate("postedBy")
    
    const friendPosts = await Promise.all(
        currentUser.following.map(async(friendId)=>{
           return await Post.find({ postedBy: friendId }).populate("postedBy")
        })
    )

     const allPosts = userPosts.concat(...friendPosts)
                               .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
                               .slice(startIndex, startIndex === 0 ? pageLimit : page * pageLimit)
                               .map(post => {
                                    const {postedBy: { _id, firstName, lastName, profilePhoto } } = post._doc
                                        return {...post._doc, postedBy:{ _id, firstName, lastName, profilePhoto}}             
                                    })
   
    res.status(200).json(allPosts)
})

const getUserPosts = asynchandler(async(req, res)=>{
    const { page } = req.query || 0
    const pageLimit = 3
    const startIndex = (Number(page)-1) * pageLimit
 
    const user = await User.findById(req.params.id)
    const posts = await Post.find({ postedBy: user._id }).populate("postedBy").sort({"createdAt": 1})
   
    const allPosts = posts.slice(startIndex, startIndex === 0 ? pageLimit : page * pageLimit)
                          .map(post => {
                                const {postedBy: { _id, firstName, lastName, profilePhoto } } = post._doc
                                    return {...post._doc, postedBy:{ _id, firstName, lastName, profilePhoto}}             
                                })
    res.status(200).json( allPosts )
})

const editPost = asynchandler(async(req, res)=>{
    const post = await Post.findById(req.params.id)
    if (post.userId === req.body.userId) {
        await Post.updateOne({ $set: req.body })
        res.status(200).json({ message: "Post updated succesfully" })
    }else{
        res.status(403).json({ message: "you can update only your post" })
    }
})

const likePost = asynchandler(async(req, res)=>{
    const post = await Post.findById(req.params.id)
    if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({ $push: { likes: req.body.userId }})
        res.status(200).json({ message: "You liked the post" })
    } else {
        await post.updateOne({ $pull: { likes: req.body.userId }})
        res.status(200).json({ message: "You unliked the post" })
    }
})
const deletePost = asynchandler(async(req, res)=>{
    const post = await Post.findById(req.params.id)
    if (post.userId === req.body.userId) {
        await post.deleteOne()
        res.status(200).json({ message: "Post deleted succesfully" })
    }else{
        res.status(403).json({ message: "you can delete only your post" })
    }
})

//Post comment

const addPostcomment = asynchandler(async(req, res)=>{
    const postId = req.params.id
    const userId = req.body.userId

   const newComment = new Postcomment({ postId, userId, comment: req.body.comment })
   const savepostComment = await newComment.save()
    if (savepostComment) {
        res.status(200).json(savepostComment)
    }else{
        res.status(401).json({ message: "Unauthorized" })
    }
})

const getPostcomment = asynchandler(async(req, res)=>{
    const postId = req.params.id

    if (postId) {
        const postComment = await Postcomment.find({ postId })
        .populate("postId")
        .populate({ path: `userId`, select: `firstName lastName profilePhoto` })
        res.status(200).json(postComment)
    }else{
        res.status(401).json({ message: "postComment" })
    }
})
module.exports = { getPost, getLikePosts, getCommentPosts, createPost, getfriendsPosts, getUserPosts, editPost, likePost, deletePost, addPostcomment, getPostcomment }