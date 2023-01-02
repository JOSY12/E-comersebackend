const mercadopago = require("mercadopago");
const {
  conn,
  Product,
  Brand,
  Category,
  Photo,
  Review,
  Favorite,
  User,
} = require("../db.js");

const getAllProducts = async (req, res) => {
  const { userId } = req.query;
  try {
    let queryProducts;
    if (!userId) {
      queryProducts = await Product.findAll({
        include: [Brand, Category, Photo, Review],
      });
    } else {
      const queryFavorite = await Favorite.findOne({
        where: {
          userId,
        },
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
                favoriteId: queryFavorite.id,
              },
            },
          },
        ],
      });
    }
    if (queryProducts.length === 0) {
      return res.status(404).json({
        msg: "No hay productos en la base de datos, agrega algunos perezos@",
      });
    }
    res.status(200).send(queryProducts);
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const getproduct = async (req, res) => {
  const { id } = req.params;

  try {
    const queryProduct = await Product.findByPk(id, {
      include: [
        Brand,
        Category,
        Photo,
        {
          model: Review,
          attributes: ["rating", "description"],
          include: {
            model: User,
            attributes: ["id", "username"],
          },
        },
      ],
    });
    if (queryProduct === null) {
      return res.status(404).json({
        msg: "No se encontró el producto que estas buscando... seguramente era una capa",
      });
    }
    const product = queryProduct.get({ plain: true });

    let totalRating = 0;
    for (let i = 0; i < product.reviews.length; i++) {
      totalRating = totalRating + product.reviews[i].rating;
    }

    // Rating promedio
    product.reviewsNumber = product.reviews.length;
    product.rating = product.reviewsNumber
      ? totalRating / product.reviewsNumber
      : null;

    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
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

    let categoriesArray = [];

    if (typeof categories === "string") {
      categoriesArray.push(categories);
    } else {
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
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
}

const getCategories = async (req, res) => {
  try {
    let allCategories = await Category.findAll();
    if (allCategories.length === 0 || !allCategories) {
      return res.status(404).json({
        msg: "Ninguna categoria en la base de datos",
      });
    }
    res.status(200).send(allCategories);
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const getBrands = async (req, res) => {
  try {
    let allBrands = await Brand.findAll();
    if (allBrands.length === 0 || !allBrands) {
      return res.status(404).json({
        msg: "No hay marcas en la base de datos, llama a Miranda Presley, a Edna Moda seguro que te ayudan con esto",
      });
    }
    res.status(200).send(allBrands);
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
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
        msg: "Llamamos a Scotland Yard, pero ni ellos encontraon lo que buscas ",
      });
    }

    const queryPhoto = await Photo.findOne({
      where: {
        productId: id,
      },
    });
    await queryPhoto.destroy({ force: true });
    await queryProduct.destroy({ force: true });
    res.status(200).json({
      msg: "Se fue, ¡Kaboom!, ya no existe más",
    });
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const softDeleteProduct = async (req, res) => {
  const { id } = req.params;
  const { restore } = req.query;

  try {
    if (restore) {
      await Product.restore({
        where: {
          id: id,
        },
      });
      const productSoftD = await Product.findOne({
        where: {
          id,
        },
      });
      productSoftD.set({
        isBan: false,
      });
      await productSoftD.save();
      return res.status(200).json({ msg: "Producto devuelta en el mapa!" });
    }
    const productToDelete = await Product.findOne({
      where: {
        id: id,
      },
    });

    if (!productToDelete) {
      return res.status(404).json({
        msg: "No hay producto que coincida con esos valores, chequear Id enviado",
      });
    } else {
      productToDelete.set({
        isBan: true,
      });
      await productToDelete.save();
      Product.destroy({
        where: {
          id: id,
        },
      });
      return res.status(200).json({ msg: "Producto escondido con exito!" });
    }
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
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
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const addNewReview = async (req, res) => {
  let { productId } = req.params;
  let { rating, description, userId } = req.body;
  try {
    const [newReview, created] = await Review.findOrCreate({
      where: {
        userId,
        productId,
      },
      defaults: {
        rating,
        description,
      },
    });

    if (created === false)
      return res.status(409).json({
        err: "Ya se agregó un review a este producto",
      });

    const reviewedProduct = await Product.findOne({
      where: {
        id: productId,
      },
      include: [Review],
    });

    return res.status(201).json(reviewedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const updateReview = async (req, res) => {
  let { productId } = req.params;
  let { rating, description, userId } = req.body;
  try {
    const existingReview = await Review.findOne({
      where: {
        userId,
        productId,
      },
    });

    if (existingReview === null)
      return res.status(404).json({
        err: "No existe el comentario que se desea actualizar",
      });

    const updatedReview = await existingReview.update({
      rating,
      description,
    });

    const reviewedProduct = await Product.findOne({
      where: {
        id: productId,
      },
      include: [Review],
    });

    return res.status(201).json(reviewedProduct);
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const getBanProd = async (req, res) => {
  try {
    const banProd = await Product.findAll({
      where: {
        isBan: true,
      },
      paranoid: false,
      include: [Brand, Category, Photo, Review],
    });
    res.status(200).send(banProd);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllProducts,
  createNewProduct,
  getCategories,
  getBrands,
  deleteProduct,
  softDeleteProduct,
  updateProduct,
  addNewReview,
  updateReview,
  getproduct,
  getBanProd,
};
