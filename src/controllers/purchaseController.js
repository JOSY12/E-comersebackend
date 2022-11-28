const { Cart, User, Product } = require('../db')


const addProductToCart = async (req, res) => {
    let { userId, productId, qty } = req.body
    try {
        const userCart = await Cart.findOne({
            where: {
                userId
            },
            include: Product
        })
        const queryProduct = await Product.findOne({
            where: {
                id: productId
            }
        })

        userCart.products.forEach(p => {
            return async function () {
                if (p.id === productId) {
                    await userCart.removeProducts(queryProduct)
                }
            }
        })

        queryProduct.quantity = qty * 1
        await queryProduct.save()
        await userCart.addProduct(queryProduct)
        
       

        res.status(200).json({
            msg: 'Articulo agregado al carrito correctamente, ¡Genial! ¡Más consumismo!'
        })
    } catch (error) {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}


const getCart = async (req, res) => {
    let { userId } = req.query
    
    try {
        const userCart = await Cart.findOrCreate({
            where: {
                userId: userId
            },
            include: Product
        })
        res.status(200).send(userCart)
    } catch (error) {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}


const removeFromCart = async (req, res) => {
    const { userId, productId } = req.body
    
    try {
        const queryCart = await Cart.findOne({
            where: {
                userId: userId
            },
            include: Product
        })

        const queryProuct = await Product.findOne({ where: { id: productId } })

        await queryCart.removeProduct(queryProuct)
        res.status(200).json({ msg: 'Articulo removido del carrito, si no puedes pagarlo...' })
    } catch (error) {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }

} 

const deleteAllCart = async (req, res) => {
    let { userId } = req.body
    try {
        const queryCart = await User.findOne({
            where: {
                id: userId

            },
            include: Cart
        })

        

        await queryCart.setCart(null)
        await queryCart.createCart()
        res.status(200).json({
            msg: 'El carrito se vació por completo, parece que no soportó el estilo Neutrón'
        })

    } catch (error) {
         res.status(500).json({
             err: 'Algo salió terriblemente mal, estamos trabajando en ello',
             description: error
         })
    }
}





module.exports = {
    addProductToCart,
    getCart,
    removeFromCart,
    deleteAllCart
}