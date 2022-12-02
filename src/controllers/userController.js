
const { User, City, Photo, conn, Favorite, Product, Brand } = require('../db.js')
const { Op } = require('sequelize')

async function createNewUser(user)
{

    let {
        email,
        given_name,
        family_name,
        nickname,
        picture
    } = user
    const transaction = await conn.transaction()
    try
    {
        let newUser = await User.create({
            email: email,
            username: nickname,
            firstName: given_name,
            lastName: family_name
        })



        await newUser.createCart()
        await newUser.createFavorite()
        await newUser.createPhoto({ url: picture, transaction })
        await transaction.commit()


        const Us = await User.findOne({
            where: {
                id: newUser.id,
            },
            include: { all: true, nested: true }
        }
        )


        return Us
    } catch (error)
    {
        return error
    }
}



const userLogin = async (req, res, next) =>
{
    console.log("This is the body:", req.body)
    const { email } = req.body

    try
    {

        const Us = await User.findOne({
            where: {
                email: email,
            },
            include: { all: true, nested: true }
        }
        )

        if (!Us)
        {
            const response = await createNewUser(req.body)

            res.status(200).send({
                msg: "Usuario creado exitosamente",
                data: await response
            })
        } else if (Us.isBan === true)
        {
            res.status(403).send({ msg: "Usuario blockeado" })
        }
        else { res.status(200).send({ data: Us }) }

    } catch (error)
    {
        console.log(error)
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}


async function updateUserData(req, res)
{
    let { userId } = req.params
    let { firstName, lastName, email, password, username, phoneNumber } = req.body

    try
    {
        let queryUser = await User.findOne({
            where: {
                id: userId
            }
        })

        const updatedUser = await queryUser.update({
            firstName,
            lastName,
            email,
            password,
            username,
            phoneNumber,
            // country,
            // city,
        })

        res.status(200).send(updatedUser)
    } catch (error)
    {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}

const completeSignUp = async (req, res) =>
{
    let { userId } = req.params
    let { phoneNumber, cityId } = req.body
    const transaction = await conn.transaction();

    try
    {
        let user = await User.findOne({
            where: { id: userId },

        });

        let city = await City.findOne({
            where: {
                id: cityId
            }
        })

        const updatedUser = await user.update({
            phoneNumber
        }, { transaction })

        await user.setCityOfOrigin(city, { transaction });

        await transaction.commit();

        res.status(200).send(updatedUser)
    } catch (error)
    {
        await transaction.rollback();
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}

async function deleteUser(req, res)
{
    const { userId } = req.params

    try
    {
        const userToDelete = await User.findOne({
            where: {
                id: userId
            }
        })

        const queryPhoto = await Photo.findOne({
            where: {
                userId: userId
            }
        })

        if (!userToDelete || userToDelete.length === 0)
        {
            return res.status(404).json({ msg: '¡Dejad al usuario tranquilo!' })
        } else
        {
            userToDelete.destroy()
            queryPhoto.destroy()
            return res.status(200).json({ msg: '¡Avada kedabra!..... Oops!' })
        }

    } catch (error)
    {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }

}

async function userSoftDelete(req, res)
{
    const { userId } = req.params;
    const { restore } = req.query;

    try
    {
        if (restore)
        {
            await User.restore({
                where: {
                    id: userId,
                },
            });
            return res.status(200).json({ msg: "Usuario devuelta en el mapa!" });
        }
        const userSoftDelete = User.findOne({
            where: {
                id: userId,
            },
        });
        if (!userSoftDelete)
        {
            return res
                .status(404)
                .json({
                    msg: "No hay usuario que coincida con esos valores, chequear Id enviado",
                });
        } else
        {
            User.destroy({
                where: {
                    id: userId,
                },
            });
            return res.status(200).json({ msg: "Usuario escondido con exito!" });
        }
    } catch (error)
    {
        res.status(500).json({
            err: "Algo salió terriblemente mal, estamos trabajando en ello",
            description: error,
        });
    }
}

const getUsers = async (req, res) =>
{
    try
    {
        const allUsers = await User.findAll({ include: { all: true, nested: true } })

        allUsers.length === 0 ? (
            res.status(404).json({
                msg: 'Ningun usuario se ha registrado aún... tu pagina no es popular... ¿Quieres que llame a una llorambulancia?'
            })
        ) : (
            res.status(200).send(allUsers)
        )
    } catch (error)
    {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}

const getFavorites = async (req, res) =>
{
    const { userId } = req.params;
    try
    {
        const favorites = await Favorite.findOne({
            where: {
                userId
            },
            include: [{
                model: Product,
                include: [Photo, Brand]
            }]
        });
        res.status(200).json(favorites);
    } catch (error)
    {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }


}

async function addToFavorites(req, res)
{
    const { userId, productId } = req.body

    try
    {
        const queryProduct = await Product.findOne({
            where: {
                id: productId
            }
        })
        const [newFavorite, created] = await Favorite.findOrCreate({
            where: {
                userId: userId
            },
            defaults: {
                userId: userId
            },
            include: Product
        })
        await newFavorite.addProducts(queryProduct)
        res.status(201).json({
            msg: '!Un nuevo favorito! ¿Qué? ¿Qué querias? ¿jugo de uva?'
        })
    } catch (error)
    {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}


async function removeFromFavorites(req, res)
{
    const { userId, productId } = req.body
    try
    {
        const queryUser = await User.findOne({
            where: {
                id: userId
            },
            include: Favorite
        })

        const queryProduct = await Product.findOne({
            where: {
                id: productId
            }
        })

        const userFavorites = await Favorite.findOne({
            where: {
                id: queryUser.favorite.id
            }
        })

        await userFavorites.removeProducts(queryProduct)
        res.status(200).json({
            msg: '¡Booo Wendy boo'
        })
    } catch (error)
    {
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}



module.exports = {

    createNewUser,
    userLogin,
    updateUserData,
    deleteUser,
    getUsers,
    userSoftDelete,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    completeSignUp

}
