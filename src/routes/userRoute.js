const { Router } = require('express')

const { createNewUser, updateUserData, deleteUser, getUsers, userLogin, getFavorites, addToFavorites, removeFromFavorites, userSoftDelete } = require('../controllers/userController.js')



const userRoute = Router()
userRoute.get('/', getUsers)
userRoute.post('/register', createNewUser)
userRoute.post('/login', userLogin)
userRoute.put('/userData/:userId', updateUserData)
userRoute.delete('/delete/:userId', deleteUser)
userRoute.delete('/softDelete/:userId', userSoftDelete)
userRoute.get('/favorites/:userId', getFavorites)
userRoute.post('/favorites', addToFavorites)
userRoute.delete('/removeFromFavorites', removeFromFavorites)


module.exports = userRoute