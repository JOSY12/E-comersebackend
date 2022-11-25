require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const {
  DATABASE_URL
} = process.env;

const sequelize = new Sequelize(DATABASE_URL, {
  protocol: 'postgres',
  dialect: 'postgres',
  dialectOptions: {
    ssl: false
  },

});
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Product, User, Photo, Review, Brand, Category, Address, Cart } = sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);

Product.hasMany(Review)
Product.hasMany(Photo)

Photo.belongsTo(Product)


Product.belongsTo(Brand)
Brand.hasMany(Product)

Product.belongsToMany(Category, ({ through: 'Product_Category' }))
Category.belongsToMany(Product, ({through: 'Product_Category'}))

User.hasOne(Address)
Address.belongsTo(User)
User.hasOne(Photo)

User.hasMany(Review)
Review.belongsTo(User)

User.hasOne(Cart)
Cart.belongsTo(User)




module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};
