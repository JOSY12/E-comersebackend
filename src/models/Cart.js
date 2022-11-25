const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    sequelize.define("cart", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
            unique: true
        }
    }, {
        timestamp: false,
        createdAt: false,
        updatedAt: false,
    })
}