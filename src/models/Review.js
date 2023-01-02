const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
{
    sequelize.define('review', {
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