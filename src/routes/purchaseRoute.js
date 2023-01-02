const { Router } = require("express");
const {
  addProductToCart,
  getCart,
  removeFromCart,
  deleteAllCart,
  buyproduct,
  buyall,
  getuserpay,
  crearhistorial,
  addtohistorial,
} = require("../controllers/purchaseController");

const storeRoute = Router();

storeRoute.post("/Historial", addtohistorial);
storeRoute.post("/paymentcomplete", crearhistorial);
storeRoute.get("/cart", getCart);
storeRoute.post("/add", addProductToCart);
storeRoute.post("/remove", removeFromCart);
storeRoute.post("/buyall", buyall);
storeRoute.post("/clean", deleteAllCart);
storeRoute.post("/payments", getuserpay);
storeRoute.post("/:id", buyproduct);

module.exports = storeRoute;
