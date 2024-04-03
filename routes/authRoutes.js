const { loginUser, registerUser, logoutUser, refresh, verifyToken } = require('../controllers/authController')
const router = require('express').Router()

router.post('/', loginUser)
      .post('/register', registerUser)
      .get('/refresh', refresh)
      .get('/:id/verify/:token', verifyToken)
      .get('/logout', logoutUser)

module.exports = router