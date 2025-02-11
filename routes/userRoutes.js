const express = require("express");
const {
    signUp,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
    protect,
} = require("../controllers/authController");
const { updateMe, getAllUsers, createUser, deleteMe, getUser, updateUser, deleteUser } = require("../controllers/userController");



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

    router.patch("/update-me", protect, updateMe)

router.delete("/delete-me", deleteMe)

router.route("/").get(getAllUsers).post(createUser)

router.route("/:id").get(getUser).post(updateUser).delete(deleteUser)


module.exports = router;
