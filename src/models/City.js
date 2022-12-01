const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
{
    sequelize.define('city', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING
        }
    },
        {
            timestamp: false,
            createdAt: false,
            updatedAt: false
        }
    )
}
