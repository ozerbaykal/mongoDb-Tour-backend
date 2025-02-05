const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

//jwt token'i olulturup döndüren fonksiyon
const signToken = (user_id) => {
    //jwt token i oluştur
    return jwt.sign(
        {
            id: user_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXP }
    );
};
//jwt tokeni oluşturup client'e gönderir
const createSendToken = (user, code, res) => {
    //tokeni oluştur
    const token = signToken(user._id);
    //client e cevap gönder
    res.status(code).json({ message: "Oturum açıldı", token, user })

}

//kayıt Ol
exports.signUp = async (req, res) => {
    try {
        //yeni bir kullanıcı oluştur

        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
        });
        //jwt token oluşutur ve client a gönder
        createSendToken(newUser, 201, res)

    } catch (error) {
        res
            .status(500)
            .json({ message: "Üzgünüz bir sorun oluştu", error: error.message });
    }
};

//giriş yap
exports.login = async (req, res) => {
    try {
        res.status(201).json({ message: "giriş yapıldı" });
    } catch (error) {
        res.status(500).json({ message: "Üzgünüz bir sorun oluştu" });
    }
};

//çıkış yap

exports.logout = (req, res) => {
    try {
        res.status(201).json({ message: "Çıkış yapıldı" });
    } catch (error) {
        res.status(500).json({ message: "Üzgünüz bir sorun oluştu" });
    }
};
