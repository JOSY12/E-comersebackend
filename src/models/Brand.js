const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    sequelize.define('brand', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true
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