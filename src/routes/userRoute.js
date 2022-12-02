const { Router } = require('express')

const { completeSignUp, updateUserData, deleteUser, getUsers, userLogin, getFavorites, addToFavorites, removeFromFavorites, userSoftDelete } = require('../controllers/userController.js')



const userRoute = Router()
userRoute.get('/', getUsers)
userRoute.post('/login', userLogin)
userRoute.patch('/:userId', completeSignUp)
userRoute.put('/userData/:userId', updateUserData)
userRoute.delete('/delete/:userId', deleteUser)
userRoute.delete('/softDelete/:userId', userSoftDelete)
userRoute.get('/favorites/:userId', getFavorites)
userRoute.post('/favorites', addToFavorites)
userRoute.delete('/removeFromFavorites', removeFromFavorites)


module.exports = userRoute