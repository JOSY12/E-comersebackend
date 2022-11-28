require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const Knex = require('knex')
const {
  DB_HOST, DB_NAME, DB_PASSWORD, DB_USER, DATABASE_URL, NODE_ENV
} = process.env;




const sequelize = NODE_ENV === 'production' ? 
  new Sequelize({
  protocol: 'postgres',
  dialect: 'postgres',
  username: DB_USER, 
  password: DB_PASSWORD,
  host: DB_HOST,
  database: DB_NAME,
  dialectOptions: {
    ssl: false
  },

}): new Sequelize(DATABASE_URL,{
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
const { Product, User, Photo, Review, Brand, Category, Address, Cart, Favorite} = sequelize.models;

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
Address.belongsTo(User, { targetKey: 'username', foreignKey: 'owner' })
User.hasOne(Photo, {sourceKey: 'username', foreignKey:'user'})

User.hasMany(Review, {sourceKey: 'username', foreignKey: 'author'})
Review.belongsTo(User, {targetKey: 'username', foreignKey: 'author'})

User.hasOne(Cart)
Cart.belongsTo(User)
Cart.hasMany(Product)

User.hasOne(Favorite)
Favorite.belongsTo(User)
Favorite.hasMany(Product)



module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};
