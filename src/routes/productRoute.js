const { Router } = require("express");
const {
  getAllProducts,
  createNewProduct,
  getproduct,
  getCategories,
  getBrands,
  deleteProduct,
  updateProduct,
  addNewReview,
} = require("../controllers/productController.js");

const productRoute = Router();


productRoute.get("/", getAllProducts);
productRoute.post("/", createNewProduct);
productRoute.get("/brands", getBrands);
productRoute.get("/categories", getCategories);
productRoute.put("/update", updateProduct);
productRoute.get("/:id", getproduct);
productRoute.delete("/:id", deleteProduct);
productRoute.post("/:productId/reviews", addNewReview);

module.exports = productRoute;
