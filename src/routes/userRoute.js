const { Router } = require('express')
const { createNewUser, loginUser, toggleBan, toggleAdmin, updateUserData, deleteUser } = require('../controllers/userController.js')



const userRoute = Router()
userRoute.post('/register', createNewUser)
userRoute.post('/login', loginUser)
userRoute.put('/getBan', toggleBan)
userRoute.put('/getAdmin', toggleAdmin)
userRoute.put('/userData/:userId', updateUserData )
userRoute.delete('/delete/:userId', deleteUser)

module.exports = userRoute