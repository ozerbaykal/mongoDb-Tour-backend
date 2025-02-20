const express = require("express");
const {
  signUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require("../controllers/authController");
const {
  updateMe,
  getAllUsers,
  createUser,
  deleteMe,
  getUser,
  updateUser,
  deleteUser,
  uploadUserPhoto,
  resize,
} = require("../controllers/userController");

const router = express.Router();

//routes

router.post("/signup", signUp);

router.post("/login", login);

router.post("/logout", logout);

router.post("/forgot-password", forgotPassword),
  router.patch("/reset-password/:token", resetPassword),
  router.patch("/reset-password/:token", resetPassword),
  router.patch("/update-password/", protect, updatePassword),
  //-----
  router.use(protect);

router.patch(
  "/update-me",
  uploadUserPhoto, //ram 'de saklar
  resize, //Yeniden  boyutlandırıp diske kaydeder
  updateMe // Veritabanındaki kullanıcı bilgilerini günceller(photo dahil)
);

router.delete("/delete-me", deleteMe);

router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).post(updateUser).delete(deleteUser);

module.exports = router;
