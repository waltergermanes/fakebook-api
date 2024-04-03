
const asynchandler = require("express-async-handler")
const User = require("../models/User")
const mongoose = require("mongoose")
const Story = require("../models/Story")

const getFriendStories= asynchandler(async(req, res)=>{
    const user = await User.findOne({ _id: req.params.id })
    const userIDs = [user._id, ...user.following].map(userid=> new mongoose.Types.ObjectId(userid))
       
    const stories = await Story.aggregate([ 
            {
                $match: {
                "userID" :  {
                         $in: userIDs
                     }
                } 
            },
             { $lookup: 
                { 
                    from: "users", 
                    localField: "userID", 
                    foreignField: "_id",
                    pipeline: [ {$project: {userID: 1, firstName: 1, lastName: 1, profilePhoto: 1 } } ],
                    as: "userData" 
                 } 
             }, { $group : 
                { 
                  _id : "$userID", 
                  type : { $first: '$type' }, 
                  url : { $last: '$url' },  
                  isActive : { $first: '$isActive' },  
                  viewers : { $last: '$viewers' },
                  userData : { $first: '$userData' } 
                
                } 
             },
         ])
         res.status(200).json(stories)
    })
    const saveStory = asynchandler(async(req, res)=>{
        const newStory = new Story(req.body)
        const saveStory = await newStory.save()
     
        if(saveStory){
            res.status(200).json({ message: `story created` })
        }
    })
    const getStory = asynchandler(async(req, res)=>{
        const{ id } = req.params
        const stories = await Story.find({ userID: id }).populate(`userID`)
        const story = await Promise.all(
            stories.map(async(story)=>{
                const {firstName, lastName, profilePhoto } = story.userID
                const { _id, url, viewers, type } = story
             
                 const viewerList = await Promise.all(
                    viewers.map(async(viewer)=>{
                      const user = await User.findById(viewer.userId)
    
                      const { _id, firstName, lastName, profilePhoto } = user
                      return { _id, firstName, lastName, profilePhoto, viewedAt: viewer.viewedAt }
                    })
                ) 
                return { _id, url, viewerList, type, header: { heading: firstName +` `+ lastName, profileImage: profilePhoto} }
            })
        )
        res.status(200).json(story)
    })

    const getStoryById = asynchandler(async(req, res)=>{
        const { id, userId } = req.params
       
        const story = await Story.findById(id).populate({ path: `userID`, select: `firstName lastName profilePhoto`})

        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }
        if(!story.viewers.some(viewer => viewer.userId === userId)){
            story.viewers.push({ userId, viewedAt: new Date() })
            await story.save()
            res.status(200).json({ message: 'Story viewed' });
        }
    })
    module.exports = { getFriendStories, saveStory, getStory, getStoryById }