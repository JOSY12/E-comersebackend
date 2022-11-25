const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    sequelize.define('address', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        street: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        houseNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        neightborhood: {
            type: DataTypes.STRING,
            allowNull: false
        },
        zipCode: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fullAddress: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.street} ${this.houseNumber}, ${this.neightborhood}, ${this.city}, ${this.country}, ${this.zipCode}`
            },
        }
    })
}