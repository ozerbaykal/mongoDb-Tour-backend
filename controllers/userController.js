const c = require("../utils/catchAsync")

//kullanıcının bilgilerini güncelle
exports.updateMe = c(async (req, res, next) => {

    res.status(200).json("işlem başarılı")
})
exports.deleteMe = c(async (req, res, next) => {

    res.status(200).json("işlem başarılı")
})
exports.getAllUsers = c(async (req, res, next) => {

    res.status(200).json("işlem başarılı")
})

exports.createUser = c(async (req, res, next) => {

    res.status(200).json("işlem başarılı")
})
exports.getUser = c(async (req, res, next) => {

    res.status(200).json("işlem başarılı")
})

exports.updateUser = c(async (req, res, next) => {

    res.status(200).json("işlem başarılı")
})
exports.deleteUser = c(async (req, res, next) => {

    res.status(200).json("işlem başarılı")
})