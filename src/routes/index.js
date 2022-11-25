const { Router } = require("express");
const adminRoute = require('./adminRoute.js')
const userRoute = require('./userRoute.js')
const productRoute = require('./productRoute.js')
const purchaseRoute = require('./purchaseRoute')
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();

router.use('/admin', adminRoute)
router.use('/user', userRoute)
router.use('/products', productRoute)
router.use('/purchase', purchaseRoute )

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

module.exports = router;
