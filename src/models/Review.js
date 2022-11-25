const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    sequelize.define('review', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
            unique: true
        },
        rating: {
            type: DataTypes.INTEGER,
            validate: {
                min: 1,
                max: 5
            },
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        }
    })
}