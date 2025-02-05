const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

//jwt token'i olulturup döndüren fonkisyon
const signToken = (user_id) => {
    //jwt token i oluştur
    return jwt.sign({
        id: user_id
    },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXP }

    )

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


        })
        //token oluşutur 

        const token = signToken(newUser._id)




        res.status(201).json({ message: "Hesabınız oluşturuldu", user: newUser, token })

    } catch (error) {

        res.status(500).json({ message: "Üzgünüz bir sorun oluştu", error: error.message })

    }
}

//giriş yap
exports.login = async (req, res) => {
    try {

        res.status(201).json({ message: "giriş yapıldı", })

    } catch (error) {

        res.status(500).json({ message: "Üzgünüz bir sorun oluştu" })

    }
}

//çıkış yap

exports.logout = (req, res) => {
    try {

        res.status(201).json({ message: "Çıkış yapıldı", })

    } catch (error) {

        res.status(500).json({ message: "Üzgünüz bir sorun oluştu" })

    }
}