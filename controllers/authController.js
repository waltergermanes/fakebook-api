const User = require("../models/User")
const asynchandler = require("express-async-handler")
const bcrypt =require("bcrypt")
const jwt = require("jsonwebtoken")
const Token = require("../models/Token")
const crypto = require("crypto")
const sendEmail = require(`../utils/sendEmail`)
require("dotenv").config()

const loginUser = asynchandler(async(req, res) =>{
 const { email , password } = req.body

 if(!email || !password)return res.status(400).json({ 'message': 'Email and password are required.' });
 const userFound = await User.findOne({ email }).exec()

 if(!userFound || !userFound.active || userFound.isAdmin) return res.status(401).json({ message: 'Unauthorized' })

 const pwdMatch = await bcrypt.compare(password, userFound.password)
 
 if(!pwdMatch) return res.status(401).json({ message: 'Unauthorized' })

 if(!userFound.emailVerified){

  let token = await Token.findById(userFound._id)

  if(!token){
    const token = await new Token({
      userId: userFound._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save()
    const url = `${process.env.ORIGIN}/verify/${userFound._id}/${token.token}`;
    await sendEmail(userFound.email, "Verify Email", url);  
  }
  res.status(200).json({message: `email sent to your accouunt`})
 }

    const accessToken = jwt.sign({
        "email": userFound.email,
        "isAdmin": userFound.isAdmin 
    },
      process.env.ACCESS_TOKEN_SECRET, 
    {   expiresIn: '1m'  })

    //create refreshToken
    const refreshToken = jwt.sign(
      {
          "email": userFound.email
      },
      process.env.REFRESH_TOKEN_SECRET, 
      {   expiresIn: '7d'  })
    
      userFound.refreshToken = refreshToken;
      const result = await userFound.save();
    //create cookie with refreshToken
    res.cookie('jwt', refreshToken, {
      httpOnly: true, //accessible only in web browser
      secure: true, // only in https
      sameSite: 'None', // cross-site cookie
      maxAge: 24 * 60 * 60 * 1000 // cookie expiry
    })

    //send accessToken
    res.json({ userId: userFound._id, email, accessToken, profilePhoto: userFound.profilePhoto, isAdmin: userFound.isAdmin})
})

const refresh = asynchandler(async(req, res)=>{
  const cookies = req.cookies
  if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })
  const refreshToken = cookies.jwt
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403); //Forbidden 
  // evaluate jwt 
  jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
         if (err || foundUser.email !== decoded.email) return res.sendStatus(403);  
          const accessToken = jwt.sign(
              {
                "email": decoded.email,
                "isAdmin": foundUser.isAdmin
              },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: '10s' }
          );
          res.json({ email: foundUser.email, 
                     userId: foundUser._id, 
                     firstName: foundUser.firstName, 
                     lastName: foundUser.lastName, 
                     profilePhoto: foundUser.profilePhoto, 
                     isAdmin: foundUser.isAdmin, 
                     accessToken })
          }
       );   
})

const logoutUser = (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(204) //No content
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
  res.json({ message: 'Cookie cleared' })
}

const registerUser = asynchandler(async(req, res)=>{
  const { password, email, lastName, firstName } = req.body.user
  
  if(!email || !password || !lastName || !firstName) return res.sendStatus(400)
  const user = await User.findOne({ email });

  if (user){
    return res.status(409).json({ message: "User is already taken!" })
  }

  const hashPwd = await bcrypt.hash(password, 10)// salt rounds

  //create new User
  const newUser = await new User({ email, "password": hashPwd, firstName, lastName }).save()
  const token = await new Token({
    userId: newUser._id,
    token: crypto.randomBytes(32).toString("hex"),
  }).save()

  const url = `${process.env.ORIGIN}/verify/${newUser._id}/${token.token}`
	await sendEmail(newUser.email, "Verify Email", url);

  if (newUser) {
    return res.status(201).json({ message: `Registration done. Check your email for verification` })

  } else {
    return res.sendStatus(409)
  }
})

const verifyToken = asynchandler(async(req, res)=>{
  const { id, token } = req.params
  const user = await User.findOne({ _id: id });

  if (!user) return res.status(400).send({ message: "Invalid link" });
  
  let emailToken = await Token.findOne({
    userId: user._id,
    token: token,
  });

  if (!token) return res.status(400).send({ message: "Invalid link" });

  await User.updateOne({ _id: user._id }, {$set: { emailVerified: true  }});
  await Token.deleteOne({ _id: emailToken._id });
  res.status(200).send({ message: "Email verified successfully" });

})

module.exports = { loginUser, registerUser, verifyToken, refresh, logoutUser }