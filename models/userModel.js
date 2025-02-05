//kullanıcı Şeması 

const { Schema, default: mongoose } = require("mongoose");
const validator = require("validator");

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Kullanıcı isim değerine sahip olmalı"],
        minLength: [3, "Kullanıcı ismi en az üç karakter olmalı"],
        maxLength: [30, "Kullanıcı ismi en fazla30  karakter olabilir"]

    },
    email: {
        type: String,
        required: [true, "Kullanıcı email değerine sahip olmalı"],
        unique: [true, "Bu eposta adresine kayıt kullanıcı zaten var"],
        validate: [validator.isEmail, "Lütfen geçerli bir mail adresi giriniz"],



    },
    photo: {
        type: String,
        default: "defaultpic.webp",

    },
    password: {
        type: String,
        required: [true, "Kullanıcı şifreye sahip olmalıdır"],
        minLength: [8, "Şİfre en az 6 karakter olmalı"],
        validate: [validator.isStrongPassword, "Şifreniz yeterince güçlü değil"]


    },
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user",
    },
    active: {
        type: Boolean,
        default: true,
    }


})

const User = mongoose.model("User", userSchema)

module.exports = User;