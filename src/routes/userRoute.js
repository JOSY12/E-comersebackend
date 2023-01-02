const { Router } = require("express");
const {
  createUserAddress,
  getUserAddresses,
  deleteUserAddress,
  completeSignUp,
  updateUserData,
  deleteUser,
  getUsers,
  userLogin,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  userSoftDelete,
  banerUsers,
} = require("../controllers/userController.js");

const userRoute = Router();

userRoute.get("/", getUsers);
userRoute.post("/login", userLogin);
userRoute.patch("/:userId", completeSignUp);
userRoute.route("/address")
.get(getUserAddresses)
.post(createUserAddress)
userRoute.route("/address/:addressId").delete(deleteUserAddress);
userRoute.put("/userData/:userId", updateUserData);
userRoute.delete("/delete/:userId", deleteUser);
userRoute.delete("/softDelete/:userId", userSoftDelete);
userRoute.get("/banerUsers", banerUsers);
userRoute.get("/favorites/:userId", getFavorites);
userRoute.post("/favorites", addToFavorites);
userRoute.delete("/removeFromFavorites", removeFromFavorites);

module.exports = userRoute;
