const { User, Review, Cart, Photo, conn } = require('../db.js')
const {Op} = require('sequelize')

async function createNewUser(req, res) {
    let { firstName, lastName, email, phoneNumber, password, username, image } = req.body
    const transaction = await conn.transaction()
    try {
        let newUser = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            username,
        })
        
           let userImage = await Photo.create(
               {
                   url: image
               },
               { transaction }
           )
        


           await newUser.setPhoto(userImage, { transaction })
      
            await transaction.commit()
        res.status(201).send(newUser)
    } catch (error) {
        res.status(500).json({
            err: 'Something went wrong please try again later',
            description: error
        })
    }
}


async function loginUser(req, res) {
    let { email, password } = req.body
    try {
        let userProfile = await User.findOne({
            where: {
                [Op.or]: [
                    {
                        email,
                        password
                    },
                    {
                        username: email,
                        password
                    }
                ]
            },
            include: [Review, Cart, Photo]
        })
        if (!userProfile || userProfile.length === 0) {
            return res.status(404).json({
                msg: 'No user found with those credentials'
            })
        }
        res.status(200).send(userProfile)
    } catch (error) {
        res.status(500).json({
            err: 'Something went wrong please try again later',
            description: error
        })
    }
}


async function toggleBan(req, res) {
    let { userId } = req.query
    
    try {
        let queryUser = await User.findOne({
            where: {
                id: userId
            }
        })

        const updatedUser = await queryUser.update({
            isBan: !queryUser.isBan,
        })

        res.status(200).send(updatedUser)
    } catch (error) {
         res.status(500).json({
             err: 'Something went wrong please try again later',
             description: error
         })
    }
}


async function toggleAdmin(req, res) {
    let { userId } = req.query

    try {
        let queryUser = await User.findOne({
            where: {
                id: userId
            }
        })

        const updatedUser = await queryUser.update({
            isAdmin: !queryUser.isAdmin
        })

        res.status(200).send(updatedUser)
    } catch (error) {
        res.status(500).json({
            err: 'Something went wrong please try again later',
            description: error
        })
    }
}


async function updateUserData(req, res) {
    let { userId } = req.params
    let { firstName, lastName, email, password, username, phoneNumber } = req.body

    try {
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
            phoneNumber
        })

        res.status(200).send(updatedUser)
    } catch (error) {
        res.status(500).json({
            err: 'Something went wrong please try again later',
            description: error
        })
    }
}

async function deleteUser(req, res) {
    const { userId } = req.params

    try {
        const userToDelete = await User.findOne({
            where: {
                id: userId
            }
        })
        
        if(!userToDelete) {
            return res.status(404).json({msg: 'No user found, check id sent'})
        } else {
            userToDelete.destroy()
            return res.status(200).json({msg: 'User destroyed successfully'})
        }

    } catch (error) {
        res.status(500).json({
            err: 'Something went wrong please try again later',
            description: error
        })
    }
}


module.exports = {
    createNewUser,
    loginUser,
    toggleBan,
    toggleAdmin,
    updateUserData,
    deleteUser
}
