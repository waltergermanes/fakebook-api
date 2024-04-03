const { getConvo, getChats, saveMessage, createConvo } = require('../controllers/messageController')

const router = require('express').Router()

router.post('/conversation', createConvo)
      .get('/conversation/:id', getConvo)
      .get('/chat/:id', getChats)
      .post('/chat/:id', saveMessage)

module.exports = router