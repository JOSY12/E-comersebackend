const { Message } = require('../db')
const {Op} = require('sequelize')

async function writeMessage(req, res) {
    const { message, expiration } = req.body
    const expirationdate = !expiration? new Date('12-31-2222') : new Date(expiration)
   
    
    try {
        const newMessage = await Message.create({
            message,
            expiration: expirationdate
            
        })
        res.status(201).send(newMessage)
    } catch (error) {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}

const getMessages = async (req, res) => {
    try {
        const allMessaes = await Message.findAll()
        res.status(200).send(allMessaes)
    } catch (error) {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}

module.exports = {
    writeMessage,
    getMessages
}