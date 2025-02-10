const express = require("express");
const { signUp, login, logout, forgotPassword, resetPassword } = require("../controllers/authController");


const router = express.Router()

//routes

router.post("/signup", signUp)
router.post("/login", login)
router.post("/logout", logout)

router.post("/forgot-password", forgotPassword),
    router.post("/reset-password/:token", resetPassword),









    module.exports = router;