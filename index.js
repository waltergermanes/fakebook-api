const express = require("express")
const app = express()
require("dotenv").config()
const { logger, logEvents } = require('./middleware/logger')
const cookieParser = require('cookie-parser')
const corsOptions = require('./config/corsOptions')
const errorHandler = require('./middleware/errorHandler')
const connectDB = require("./config/dbConn")
const mongoose = require("mongoose")
const cors = require("cors")
const verifyJWT = require("./middleware/verifyJWT")
const credentials = require("./middleware/credentials")
const userHandlers = require("./listeners/userHandler");

connectDB()
app.use(logger)
app.use(credentials)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use("/auth", require("./routes/authRoutes"))
app.use(verifyJWT)
app.use("/stories", require("./routes/storyRoutes"))
app.use("/user", require("./routes/userRoutes"))
app.use("/post", require("./routes/postRoutes"))
app.use("/message", require("./routes/messageRoutes"))
app.use(errorHandler)
const expressServer =  app.listen(process.env.PORT, ()=> console.log(`SERVER LISTENING FROM PORT 5000`))
mongoose.connection.once("open", ()=>{
  
    console.log("connected to mongoDB")
   
    const io = require("socket.io")(expressServer, {
        cors: {
          origin: "https://fakebook-at9w.onrender.com",
        },
      });
    
    const onConnection = (socket) => {
        userHandlers(io, socket);
      }
    io.on("connection", onConnection);
})
mongoose.connection.on("error", (err)=>{
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})