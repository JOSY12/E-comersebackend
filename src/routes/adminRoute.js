const { Router } = require('express')
const {toggleProductAsFeatured, toggleAdmin, toggleBan} = require('../controllers/adminController')


const adminRoute = Router()

adminRoute.post('/featured/:productId', toggleProductAsFeatured)
adminRoute.put('/getBan', toggleBan)
adminRoute.put('/getAdmin', toggleAdmin)

module.exports = adminRoute
