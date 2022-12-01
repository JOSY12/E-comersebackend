const { Sequelize } = require("sequelize");
const mercadopago = require("mercadopago");
const {
  conn,
  Product,
  Brand,
  Category,
  Photo,
  Review,
  User,
  Favorite
} = require("../db.js");

const getAllProducts = async (req, res) =>
{
  const { userId } = req.query;
  try
  {
    let queryProducts;
    if (!userId)
    {
      queryProducts = await Product.findAll({
        include: [
          Brand,
          Category,
          Photo,
          Review
        ],
      });
    }
    else 
    {
      const queryFavorite = await Favorite.findOne({
        where: {
          userId
        }
      });

      queryProducts = await Product.findAll({
        include: [
          Brand,
          Category,
          Photo,
          Review,
          {
            model: Favorite,
            through: {
              where: {
                favoriteId: queryFavorite.id
              }
            }
          }
        ]
      });
    }
    if (queryProducts.length === 0)
    {
      return res.status(404).json({
        msg: "No hay productos en la base de datos, agrega algunos perezos@",
      });
    }
    res.status(200).send(queryProducts);
  } catch (error)
  {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const getproduct = async (req, res) =>
{
  const { id } = req.params;

  try
  {
    const product = await Product.findByPk(id, {
      include: [Brand, Category, Photo, Review],
    });
    if (product.length === 0)
    {
      return res.status(404).json({
        msg: "No se encontró el producto que estas buscando... seguramente era una capa",
      });
    }
    res.status(200).json(product);
  } catch (error)
  {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

async function createNewProduct(req, res)
{
  const {
    name,
    stock,
    unitPrice,
    productBrand,
    image,
    categories,
    description,
  } = req.body;
  const transaction = await conn.transaction();
  try
  {
    const newProduct = await Product.create(
      {
        name,
        stock,
        unitPrice,
        description,
        include: [Brand, Category, Photo],
      },
      { transaction }
    );

    let productImage = await Photo.create(
      {
        url: image,
      },
      { transaction }
    );

    await newProduct.addPhoto(productImage, { transaction });

    let [queryBrand, created] = await Brand.findOrCreate({
      where: {
        name: productBrand,
      },
      defaults: {
        name: productBrand,
      },
      transaction,
    });

    await newProduct.setBrand(queryBrand, { transaction });

    let categoriesArray = [];

    if (typeof categories === "string")
    {
      categoriesArray.push(categories);
    } else
    {
      categories.map((c) => categoriesArray.push(c));
    }

    let queryCategories = await Promise.all(
      categoriesArray.map(
        async (categoryName) =>
          await Category.findOrCreate({
            where: {
              name: categoryName,
            },
            defaults: {
              name: categoryName,
            },
            transaction,
          })
      )
    );

    // queryCategories es un arreglo de arreglos de tipo [queryCategory, created], solo nos interesa queryCategory
    queryCategories = queryCategories.map((result) => result[0]);

    const readyProduct = await newProduct.addCategories(queryCategories, {
      transaction,
    });

    await transaction.commit();
    res.status(201).send(readyProduct);
  } catch (error)
  {
    await transaction.rollback();
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
}

const getCategories = async (req, res) =>
{
  try
  {
    let allCategories = await Category.findAll();
    if (allCategories.length === 0 || !allCategories)
    {
      return res.status(404).json({
        msg: "Ninguna categoria en la base de datos",
      });
    }
    res.status(200).send(allCategories);
  } catch (error)
  {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const getBrands = async (req, res) =>
{
  try
  {
    let allBrands = await Brand.findAll();
    if (allBrands.length === 0 || !allBrands)
    {
      return res.status(404).json({
        msg: "No hay marcas en la base de datos, llama a Miranda Presley, a Edna Moda seguro que te ayudan con esto",
      });
    }
    res.status(200).send(allBrands);
  } catch (error)
  {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const deleteProduct = async (req, res) =>
{
  let { id } = req.params;

  try
  {
    let queryProduct = await Product.findOne({
      where: {
        id,
      },
    });
    if (queryProduct.length === 0 || !queryProduct)
    {
      return res.status(404).json({
        msg: "Llamamos a Scotland Yard, pero ni ellos encontraon lo que buscas ",
      });
    }

    const queryPhoto = await Photo.findOne({
      where: {
        productId: id,
      },
    });
    await queryPhoto.destroy();
    await queryProduct.destroy();
    res.status(200).json({
      msg: "Se fue, ¡Kaboom!, ya no existe más",
    });
  } catch (error)
  {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const updateProduct = async (req, res) =>
{
  let { productId } = req.query;
  let { name, description, stock, unitPrice } = req.body;
  try
  {
    const queryProduct = await Product.findOne({
      where: {
        id: productId,
      },
    });

    const updatedProduct = await queryProduct.update({
      name,
      description,
      stock,
      unitPrice,
    });
    res.status(201).send(updatedProduct);
  } catch (error)
  {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const addNewReview = async (req, res) =>
{
  let { productId } = req.params;
  let { rating, description, userId } = req.body;
  try
  {
    const queryProduct = await Product.findOne({
      where: {
        id: productId,
      },
    });
    const queryUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    const newReview = await Review.create({
      rating,
      description,
    });
    await newReview.setUser(queryUser);
    const reviewedProduct = await queryProduct.addReviews(newReview);
    res.status(201).send(reviewedProduct);
  } catch (error)
  {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};


module.exports = {
  getAllProducts,
  createNewProduct,
  getCategories,
  getBrands,
  deleteProduct,
  updateProduct,
  addNewReview,
  getproduct,
};
