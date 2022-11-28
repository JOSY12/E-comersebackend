const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    sequelize.define('favorite', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
            unique: true
        },

    })}