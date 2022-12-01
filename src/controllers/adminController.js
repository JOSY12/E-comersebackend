const { Product } = require('../db')


async function toggleProductAsFeatured(req, res)
{
    let { productId } = req.params
    try
    {
        const queryProduct = await Product.findByPk(productId)
        queryProduct.isFeatured = !queryProduct.isFeatured
        await queryProduct.save()
        if (queryProduct.isFeatured === true)
        {
            return res.status(201).json({
                msg: '¡Llevelo! ¡llevelo!, que el producto ahora es de destacado y no va a durar'
            })
        } else
        {
            return res.status(201).json({
                msg: `Deshonor, deshonrado el producto, deshonor sobre su familia, deshonrada su vaca `
            })
        }
    } catch (error)
    {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}

async function toggleBan(req, res)
{
    let { userId } = req.query

    try
    {
        let queryUser = await User.findOne({
            where: {
                id: userId
            }
        })

        const updatedUser = await queryUser.update({
            isBan: !queryUser.isBan
        })

        updatedUser.isBan === true ? res.status(200).json({
            msg: `${updatedUser.username} ya no ser bienvenido a H-Couture`
        }) : (
            res.status(200).json({
                msg: `${updatedUser.username} te juro que fue un error de dedo, no te queriamos bannear`
            })
        )
    } catch (error)
    {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}

async function toggleAdmin(req, res)
{
    let { userId } = req.query

    try
    {
        let queryUser = await User.findOne({
            where: {
                id: userId
            }
        })

        const updatedUser = await queryUser.update({
            isAdmin: !queryUser.isAdmin
        })

        updatedUser.isBan === true ? (res.status(200).json({
            msg: `${updatedUser.username} ya no ser bienvenido a H-Couture`
        })
        ) : (res.status(200).json({
            msg: `${updatedUser.username} te juro que fue un error de dedo, no te queriamos bannear`
        }))
    } catch (error)
    {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}

module.exports = {
    toggleProductAsFeatured,
    toggleAdmin,
    toggleBan
}