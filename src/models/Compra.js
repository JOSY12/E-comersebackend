const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    sequelize.define(
        'compra',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                unique: true
            },
            preferenceid: {
                type: DataTypes.STRING,  
                allowNull: false,
            
            },
            collectionid: {
                type: DataTypes.STRING,
                allowNull: false,
              
            },
            merchantorderid: {
                type: DataTypes.STRING,
                allowNull: false,
      
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
       
            },
            paymenttype: {
                type: DataTypes.STRING,
                allowNull: true,
          
            },
            collectionstatus: {
                type: DataTypes.STRING,
                allowNull: true,
          
            },
            },
        {
            timestamp: true,
            createdAt: 'fechaDeCompra',
            updatedAt: false
        }
    )
}
