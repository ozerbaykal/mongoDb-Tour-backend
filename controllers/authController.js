const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

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
    res.status(code).json({ message: "Oturum açıldı", token, user });
};

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
        createSendToken(newUser, 201, res);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Üzgünüz bir sorun oluştu", error: error.message });
    }
};

//giriş yap
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        //1)email ve şifre geldimi kontrol et
        if (!email || !password) {
            return res.status(400).json({ message: "Lütfen mail ve şifre giriniz" })
        }

        //2)client 'tan gelen email ile kayıtlı kullanıcı var mı kontrol et
        const user = await User.findOne({ email })

        //2.1)kayıtlı kullanıcı yoksa hata fırlat
        if (!user) {
            return res.status(400).json({ message: "girdiğiniz mail kayıtlı kullancı bulunamadı" })
        }

        //3)client'tan gelen şifre ile veritabanında saklanan haslenmiş şifre ile eşleniyor mu kontrol et
        const isValid = await bcrypt.compare(password, user.password)

        //3.1) şifre yanlışssa hata fırlat
        if (!isValid) {
            return res.status(400).json({ message: "şifreniz  hatalı,lütfen geçerli bir şifre girin" })

        }

        //4) jwt token i oluşturup gönder
        createSendToken(user, 200, res)

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
