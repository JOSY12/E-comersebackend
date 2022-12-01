const { DataTypes } = require('sequelize')

module.exports = (sequelize) =>
{
    sequelize.define("user", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        firstName: {
            type: DataTypes.STRING,

        },
        lastName: {
            type: DataTypes.STRING,

        },
        fullName: {
            type: DataTypes.VIRTUAL,
            get()
            {
                return `${this.firstName} ${this.lastName}`
            }
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true
            },
            allowNull: false,
            unique: true
        },
        phoneNumber: {
            type: DataTypes.STRING,

        },
        username: {
            type: DataTypes.STRING,
            unique: true,
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isBan: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true,
        createdAt: 'unitedAt',
        updatedAt: 'modifyAt',
        paranoid: true
    })
}