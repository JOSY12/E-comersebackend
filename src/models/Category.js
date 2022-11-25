const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    sequelize.define('category', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            unique: true
        }
    }, {
        timestamp: false,
        createdAt: false,
        updatedAt: false,
    })
}