const { Router } = require("express");
const adminRoute = require('./adminRoute.js');
const userRoute = require('./userRoute.js');
const productRoute = require('./productRoute');
const storeRoute = require('./purchaseRoute');
const countryRoute = require("./countryRoute.js");

// Ejemplo: const authRouter = require('./auth.js');

const router = Router();

router.use('/admin', adminRoute);
router.use('/user', userRoute);
router.use('/products', productRoute);
router.use('/store', storeRoute);
router.use('/country', countryRoute);

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

module.exports = router;
