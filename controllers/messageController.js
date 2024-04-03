const asynchandler = require("express-async-handler")
const User = require("../models/User")
const Conversation = require("../models/Conversation")
const Message = require("../models/Message")
const { mongoose } = require("mongoose")


const createConvo = asynchandler(async(req, res)=> {
    const { userIDs } = req.body
    const newConvo = new Conversation({ members: userIDs })
    const saveConvo = await newConvo.save()

    if(!saveConvo){
        res.status(500).json({ message: `something went wrong` })
    }
})
const getConvo = asynchandler(async(req, res)=>{
    const convos = await Conversation.find({
        members: { $in: [ req.params.id ] }
    })
   const allMessages = await Promise.all(
    convos.map(async(convo)=> {
       const message = await Message.find({ conversationId : convo._id }).populate("conversationId")
       let noMessage = ``
       if(message.length < 1){
        noMessage = [{ conversationId: {_id: convo._id, members: convo.members, createdAt: convo.createdAt, updatedAt: convo.updatedAt} }]
       }
       return [...message, ...noMessage]
    })
   )

   const getLastMessage = allMessages.map(messages=> messages.slice(-1)).flat()

   const getLastMessageAndFetchUser = await Promise.all(
    getLastMessage.map(async (message)=>{
         const members =  await Promise.all(
         message.conversationId.members.map(async(userId)=>{
             return await User.find({ _id: userId })
         })
         )
         const usersArr = members.flat()
         const users = usersArr.map(user=>{
            const {_id, firstName, lastName, profilePhoto} = user
               return {_id, firstName, lastName, profilePhoto}
            })
         const {conversationId, sender, text, createdAt  } = message
         return { conversationId : conversationId._id, 
                  conversationCreated: conversationId.createdAt, 
                  sender, text, createdAt, members: users }
     })
   )
   
/*     const c = await Message.aggregate([
        {
            $match:  {
                "sender": new mongoose.Types.ObjectId(req.params.id)
            } 
        },    { $lookup: 
            { 
                from: "conversations", 
                localField: "conversationId", 
                foreignField: "_id",
                pipeline: [ {$project: {members: 1 } } ],
                as: "members" 
             } 
            },
        
        { $lookup: 
            { 
                from: "users", 
                localField: "sender", 
                foreignField: "_id",
                pipeline: [ {$project: {sender: 1, firstName: 1, lastName: 1, profilePhoto: 1 } } ],
                as: "userData" 
             } 
            },  { $group :  { 
                _id : "$conversationId", 
                sender : { $last: '$sender' }, 
                text : { $last: '$text' },  
                createdAt : { $last: '$createdAt' },  
                updatedAt : { $last: '$updatedAt' },
                members : { $last: '$members' },
              } 
            }
    ])
 console.log(c) */
 if (getLastMessageAndFetchUser) {
    res.status(200).json(getLastMessageAndFetchUser)
}else{
    res.status(401).json({ message: "Something went wrong" })
}
})

const getChats = asynchandler(async(req, res)=>{
  const { id } = req.params
  const allMessages = await Message.find({ conversationId: id }).populate("sender")
  
  const messages = allMessages.map(m=>{
    const { _id, firstName, lastName, profilePhoto } = m._doc.sender
    return {...m._doc, sender: { _id, firstName, lastName, profilePhoto }}
  })
  if (messages) {
    res.status(200).json(messages)
}else{
    res.status(401).json({ message: "Something went wrong" })
}
})

const saveMessage = asynchandler(async(req, res)=>{
    const newMessage = new Message(req.body)
    const message = await newMessage.save()
    if(message){
        res.status(200).json(message)
    }else{
        res.status(401).json({ message: "Something went wrong" })
    }

})
module.exports = { createConvo, getConvo, getChats, saveMessage }
