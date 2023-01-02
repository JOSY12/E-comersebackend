const { Router } = require('express')
const {writeMessage, getMessages} = require('../controllers/messageController')

const messageRoute = Router()

messageRoute.get('/', getMessages)
messageRoute.post('/write', writeMessage)



module.exports = messageRoute