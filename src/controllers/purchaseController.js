const { Cart, User, Product } = require("../db");
const mercadopago = require("mercadopago");

const addProductToCart = async (req, res) => {
  let { userId, productId, qty } = req.body;
  try {
    const userCart = await Cart.findOne({
      where: {
        userId,
      },
      include: Product,
    });
    const queryProduct = await Product.findOne({
      where: {
        id: productId,
      },
    });

    userCart.products.forEach((p) => {
      return async function () {
        if (p.id === productId) {
          await userCart.removeProducts(queryProduct);
        }
      };
    });

    queryProduct.quantity = qty * 1;
    await queryProduct.save();
    await userCart.addProduct(queryProduct);

    res.status(200).json({
      msg: "Articulo agregado al carrito correctamente, ¡Genial! ¡Más consumismo!",
    });
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const getCart = async (req, res) => {
  let { userId } = req.query;

  try {
    const userCart = await Cart.findOrCreate({
      where: {
        userId: userId,
      },
      include: Product,
    });
    res.status(200).send(userCart);
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const queryCart = await Cart.findOne({
      where: {
        userId: userId,
      },
      include: Product,
    });

    const queryProuct = await Product.findOne({ where: { id: productId } });

    await queryCart.removeProduct(queryProuct);
    res
      .status(200)
      .json({ msg: "Articulo removido del carrito, si no puedes pagarlo..." });
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const buyproduct = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const product = await Product.findByPk(id);
    if (product.length === 0) {
      return res.status(404).json({
        msg: "No se encontró el producto que estas buscando... seguramente era una capa",
      });
    }

    let preference = {
      items: [
        {
          id: product.id,
          title: product.name,
          unit_price: product.unitPrice,
          quantity: quantity,
        },
      ],
      back_urls: {
        success: `https://localhost:3000/ipayments/${id}`,
        failure: "https://localhost:3000/paymentsfail",
        pending: "https://localhost:3000/paymentspending",
      },
      auto_return: "approved",
      // notification_url: `https://localhost:3000/store/payments`,
    };

    mercadopago.preferences.create(preference).then(function (response) {
      res.status(200).json(response.body.init_point);
      console.log(response.body);
    });
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const getpayinfo = async (req, res) => {
  const { body, query } = req;
  if (!body && !query) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }

  try {
    const info = [...body, ...query];
    res.status(200).json(info);
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const buyall = async (req, res) => {
  let { userId } = req.body;

  try {
    const userCart = await Cart.findOne({
      where: {
        userId: userId,
      },
      include: Product,
    });
    const cart = userCart.products;

    const user = await User.findOne({
      where: {
        id: userId,
      },
      include: Cart,
    });

    var preference = {
      items: [],

      payer: {
        email: user.email,
        name: user.username,
      },
      back_urls: {
        success: `https://localhost:3000/payments/${userId}`,
        failure: "https://localhost:3000/paymentsfail",
        pending: "https://localhost:3000/paymentspending",
      },
      auto_return: "approved",
      // notification_url: `https://localhost:3000/store/payments`,
    };

    for (let e of cart) {
      preference.items.push({
        id: e.id,
        title: e.name,
        unit_price: e.unitPrice,
        quantity: parseInt(e.quantity),
      });
    }

    mercadopago.preferences.create(preference).then(function (response) {
      res.status(200).json(response.body.init_point);
    });
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const deleteAllCart = async (req, res) => {
  let { userId } = req.body;
  try {
    const queryCart = await User.findOne({
      where: {
        id: userId,
      },
      include: Cart,
    });

    await queryCart.setCart(null);
    await queryCart.createCart();
    res.status(200).json({
      msg: "El carrito se vació por completo, parece que no soportó el estilo Neutrón",
    });
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

module.exports = {
  addProductToCart,
  getCart,
  removeFromCart,
  deleteAllCart,
  buyproduct,
  buyall,
  getpayinfo,
};
