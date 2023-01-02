const { Router } = require("express");
const {
  getAllProducts,
  createNewProduct,
  getproduct,
  getCategories,
  getBrands,
  deleteProduct,
  softDeleteProduct,
  updateProduct,
  addNewReview,
  updateReview,
  getBanProd,
} = require("../controllers/productController.js");

const productRoute = Router();

productRoute.get("/", getAllProducts);
productRoute.post("/", createNewProduct);
productRoute.get("/brands", getBrands);
productRoute.get("/categories", getCategories);
productRoute.put("/update", updateProduct);
productRoute.get("/banProducts", getBanProd);
productRoute.get("/:id", getproduct);
productRoute.delete("/:id", deleteProduct);
productRoute.delete("/softDelete/:id", softDeleteProduct);
productRoute.post("/:productId/review", addNewReview);
productRoute.put("/:productId/review", updateReview);

module.exports = productRoute;
