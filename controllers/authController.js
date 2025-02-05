const User = require("../models/userModel")


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

        res.status(201).json({ message: "Hesabınız oluşturuldu", user: newUser, })

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