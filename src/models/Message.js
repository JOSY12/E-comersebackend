const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    sequelize.define("message", {
       
        message: {
            type: DataTypes.STRING,
        },
        expiration: {
            type: DataTypes.DATEONLY
        },

    },
        {
            timestamp: false,
            createdAt: false,
            updatedAt: false,
    })
}