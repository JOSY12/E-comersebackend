const { Router } = require('express')
const {addProductToCart, getCart, removeFromCart, deleteAllCart} = require('../controllers/purchaseController')

const purcasheRoute = Router()

purcasheRoute.get('/cart', getCart)
purcasheRoute.post('/add', addProductToCart)
purcasheRoute.post('/remove', removeFromCart)
purcasheRoute.delete('/clean', deleteAllCart)



module.exports = purcasheRoute