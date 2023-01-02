const { Cart, User, Product, Compra, Historial } = require("../db");
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

const addtohistorial = async (req, res) => {
  let { userId, productId } = req.body;
  try {
    const historial = await Historial.findOne({
      where: {
        userId,
      },
      include: Product,
    });

    const producto = await Product.findOne({
      where: {
        id: productId,
      },
    });

    await historial.createtohistorial(producto);

    res.status(200).json({
      msg: "Articulo agregado al historial correctamente)",
    });
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const crearhistorial = async (req, res) => {
  const {
    userId,
    preference_id,
    status,
    collection_id,
    collection_status,
    payment_type,
    merchant_order_id,
  } = req.body;
  try {
    const usuario = await User.findOne({
      where: {
        id: userId,
      },
    });

    const creado = await Compra.findOne({
      where: {
        collectionid: collection_id,
      },
    });

    if (!creado && preference_id && collection_id) {
      const compra = await usuario.createCompra({
        preferenceid: preference_id,
        collectionid: collection_id,
        merchantorderid: merchant_order_id,
        status: status,
        paymenttype: payment_type,
        collectionstatus: collection_status,
      });

      res.status(200).json(
        {
          msg: "Articulo creado exitosamente en database al historial correctamente, ¡Genial! ¡Más consumismo!",
        },
        { compra: compra }
      );
    }

    res
      .status(200)
      .json({ msg: "Articulo ya existe en database al historial" });
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
  const {
    quantity,
    userId,
    Apellido,
    Barrio,

    Ciudad,
    Estado,
    Nombre,
    Pais,
    Prefijo,
    Telefono,
    calle1,
    calle2,
    zipcode,
    tipoCalle,
    numerocalle,
  } = req.body;

  try {
    const product = await Product.findByPk(id, { include: { all: true } });
    if (product.length === 0) {
      return res.status(404).json({
        msg: "No se encontró el producto que estas buscando... seguramente era una capa",
      });
    }

    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    product.stock = product.stock - quantity
    await product.save()
    const queryCart = await Cart.findOne({
      where: {
        userId: userId
      },
      include: Product
    })

    queryCart.removeProduct(product);

    let preference = {
      payer: {
        phone: {
          area_code: Prefijo,
          number: parseInt(Telefono),
        },
        address: {
          zip_code: zipcode,
          street_name: tipoCalle,
          street_number: parseInt(numerocalle),
        },
        email: user.email,

        name: user.username,
        surname: Apellido,
      },
      shipments: {
        receiver_address: {
          zip_code: zipcode, //string
          street_name: tipoCalle, //string
          street_number: parseInt(numerocalle),
          floor: `${calle1}-${calle2}`, //string
          apartment: `${calle1}-${calle2}`, //string
          city_name: Ciudad, //string
          state_name: `${Estado}-${Barrio}`, //string
          country_name: Pais, //string
        },
      },

      items: [
        {
          id: product.id,
          title: product.name,
          unit_price: product.unitPrice,
          quantity: parseInt(quantity),
          picture_url: product.photos[0].url,
        },
      ],

      back_urls: {
        success: `https://h-couture-odxfhjkfia-uc.a.run.app/ItemPayments/${userId}`,
        failure: `https://h-couture-odxfhjkfia-uc.a.run.app/paymentsfail/${userId}`,
        pending: `https://h-couture-odxfhjkfia-uc.a.run.app/paymentspending/${userId}`,
      },
      auto_return: "approved",
      // notification_url: `http://localhost:3001/store/payments/`,
      external_reference: "H-COMERSEHENRY",
    };

    mercadopago.preferences.create(preference).then(async function (response) {
      res.status(200).json(response.body);
    });
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const getpayinfo = async (req, res) => {
  try {
    res.status(200).json(req.body);

    // await Compra.findOrCreate({

    // })
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const getuserpay = async (req, res) => {
  const { userId } = req.body;
  try {
    const usuario = await User.findOne({
      where: {
        id: userId,
      },
    });

    const data = await usuario.getCompras();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      err: "Algo salió terriblemente mal, estamos trabajando en ello",
      description: error,
    });
  }
};

const buyall = async (req, res) => {
  const {
    Cartitems,
    userId,
    Apellido,
    Barrio,
    Ciudad,
    Estado,
    Nombre,
    Pais,
    Prefijo,
    Telefono,
    calle1,
    calle2,
    zipcode,
    tipoCalle,
    numerocalle,
  } = req.body;

  try {
    const user = await User.findOne({
      where: {
        id: userId,
      },
      include: Cart,
    });

    var preference = {
      items: [],

      payer: {
        phone: {
          area_code: Prefijo,
          number: parseInt(Telefono),
        },
        address: {
          zip_code: zipcode,
          street_name: tipoCalle,
          street_number: parseInt(numerocalle),
        },
        email: user.email,

        name: user.username,
        surname: Apellido,
      },
      shipments: {
        receiver_address: {
          zip_code: zipcode, //string
          street_name: tipoCalle, //string

          street_number: parseInt(numerocalle),

          state_name: `${Estado}-${Barrio}`, //string
          apartment: `${calle1}-${calle2}`, //string
          city_name: Ciudad, //string

          country_name: Pais, //string
        },
      },
      back_urls: {
        success: `https://h-couture-odxfhjkfia-uc.a.run.app/CartPayments/${userId}`,
        failure: `https://h-couture-odxfhjkfia-uc.a.run.app/paymentsfail/${userId}`,
        pending: `https://h-couture-odxfhjkfia-uc.a.run.app/paymentspending/${userId}`,
      },
      auto_return: "approved",
      // notification_url: `http://localhost:3001/store/payments`,
      external_reference: "H-COMERSEHENRY",
    };

    for (let e of Cartitems) {
      preference.items.push({
        id: e.id,
        title: e.name,
        unit_price: e.unitPrice,
        quantity: parseInt(e.quantity),
        picture_url: e.photos[0].url,
      });
    }

      Cartitems.forEach( async product => {
          const queryProduct = await Product.findOne({
              where: {
                  id: product.id
              }
          })
          queryProduct.stock = queryProduct.stock - product.quantity
          await queryProduct.save()
      })

    mercadopago.preferences.create(preference).then(function (response) {
      res.status(200).json(response.body);
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
  crearhistorial,
  getuserpay,
  addtohistorial,
};
