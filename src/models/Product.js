const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    sequelize.define('product', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        unitPrice: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quantity: {
            type: DataTypes.STRING,
            
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    })
}