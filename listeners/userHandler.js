const User = require("../models/User")

let users = []

module.exports = (io, socket) => {
  
    const addUser = async (userId) => {
      console.log(socket.id, `joined`)
      try {
        const user = await User.findById(userId)
        const { firstName, lastName, profilePhoto } = user
        !users?.some(user => user.userId === userId) && users.push({ userId, firstName, lastName, profilePhoto, socketId: socket.id })
      } catch (error) {
        console.log(error)
      }
      io.emit("getUsers", users)
   // console.log(users)

  }
    const removerUser = ()  => {
     // console.log(`${socket.id} left`)
      users = users?.filter(user => user.socketId !== socket.id)
     io.emit("getUsers", users)
  }

  const sendMessage = (data)  => {
    const { recieverID } = data;
   // console.log(data)
    //console.log(users, `users`)
    const recieverUsers = users.filter((user) => recieverID?.includes(user.userId));

   // console.log("Sending from socket to :", recieverID)
    //console.log("Data: ", recieverUsers)
    if (recieverUsers.length) {
      recieverUsers.forEach(user=> (
      io.to(user.socketId).emit("receiveMessage", data)
     ))
    }
}

   // socket.on("connect", konek);
    socket.on("addUser", addUser);
    socket.on("disconnect", removerUser);
    socket.on("sendMessage", sendMessage);

  }