const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    sequelize.define('photo', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        url: {
            type: DataTypes.TEXT,
            validate: {
                isUrl: true
            }

        }
    }, {
        timestamp: false,
        createdAt: false,
        updatedAt: false,
    })
}