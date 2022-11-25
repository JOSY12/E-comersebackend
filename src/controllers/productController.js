const { Sequelize } = require("sequelize");
const {
  conn,
  Product,
  Brand,
  Category,
  Photo,
  Review,
  User,
} = require("../db.js");

const getAllProducts = async (req, res) => {
  try {
    const queryProducts = await Product.findAll({
      include: [Brand, Category, Photo, Review],
    });
    if (queryProducts.length === 0) {
      return res.status(404).json({
        msg: "No products in the database yet",
      });
    }
    res.status(200).send(queryProducts);
  } catch (error) {
    res.status(500).json({
      err: "Something went wrong please try again later",
    });
  }
};

const getproduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id, {
      include: [Brand, Category, Photo, Review],
    });
    if (product.length === 0) {
      return res.status(404).json({
        msg: "No products in the database yet",
      });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      err: "Something went wrong with the id please try again later",
    });
  }
};

async function createNewProduct(req, res) {
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
  try {
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

    let queryCategories = await Promise.all(
      categories.map(
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
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      err: "Something went wrong please try again later",
      description: error,
    });
  }
}

const getCategories = async (req, res) => {
  try {
    let allCategories = await Category.findAll();
    if (allCategories.length === 0 || !allCategories) {
      return res.status(404).json({
        msg: "No categories in database",
      });
    }
    res.status(200).send(allCategories);
  } catch (error) {
    res.status(500).json({
      err: "Something went wrong please try again later",
      description: error,
    });
  }
};

const getBrands = async (req, res) => {
  try {
    let allBrands = await Brand.findAll();
    if (allBrands.length === 0 || !allBrands) {
      return res.status(404).json({
        msg: "No brands in database",
      });
    }
    res.status(200).send(allBrands);
  } catch (error) {
    res.status(500).json({
      err: "Something went wrong please try again later",
      description: error,
    });
  }
};

const deleteProduct = async (req, res) => {
  let { id } = req.params;

  try {
    let queryProduct = await Product.findOne({
      where: {
        id,
      },
    });
    if (queryProduct.length === 0 || !queryProduct) {
      return res.status(404).json({
        msg: "No matches",
      });
    }
    await queryProduct.destroy();
    res.status(200).json({
      msg: "The product was successfully deleted",
    });
  } catch (error) {
    res.status(500).json({
      err: "Something went wrong please try again later",
      description: error,
    });
  }
};

const updateProduct = async (req, res) => {
  let { productId } = req.query;
  let { name, description, stock, unitPrice } = req.body;
  try {
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
  } catch (error) {
    res.status(500).json({
      err: "Something went wrong please try again later",
      description: error,
    });
  }
};

const addNewReview = async (req, res) => {
  let { productId } = req.params;
  let { rating, description, userId } = req.body;
  try {
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
  } catch (error) {
    res.status(500).json({
      err: "Something went wrong please try again later",
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
