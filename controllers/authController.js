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

    //çerez olarak gönderilecek veriyi belirle
    res.cookie("jwt", token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        //secure:true, //true olunca sadece https protokolündeki domainlerde seyehat eder
    })

    //şifreyi client'a gönderilen cevaptan kaldır
    user.password = undefined

    //client e cevap gönder
    res.status(code).json({ message: "Oturum açıldı", token, user });
};

//>>>>>>>>>>>>>>>kayıt Ol
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

//>>>>>>>>>>>>>>>giriş yap
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
        const isValid = await user.correctPass(password, user.password)

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

//>>>>>>>>>>>>>>>>çıkış yap

exports.logout = (req, res) => {
    try {

        res.clearCookie("jwt").status(200).json({ message: "Çıkış yapıldı" });
    } catch (error) {
        res.status(500).json({ message: "Üzgünüz bir sorun oluştu" });
    }
};






//>>>>>>>>>>>> Authorization MW
// Client'ın gönderdiği tokenin geçerliliğini doğrulayıp;
// Geçerliyse route'a erişime izin vermeli
// Geçerli değilse hata fırlat

exports.protect = async (req, res, next) => {

    //1) client tan gelen tokeni al
    let token = req.cookies.jwt || req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
        token = token.split(" ")[1]
    }

    //1.2) token gelmediyse hata fırlat
    if (!token) {
        return res.status(403).json({ message: "Bu işlem için yetkiniz yok (jwt gönderilmedi)" })
    }

    // 2) token geçerliliğini doğrulunu kontrol et(zaman aşımına uğradımı / imza doğrumu )
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);

    } catch (error) {
        if (error.message === "jwt expired") {

            return res.status(403).json({ message: "Oturumunuzun süresi doldu(tekrar giriş yapın)" })
        }
        console.log(error);
        return res.status(403).json({ message: "Gönderilen token geçersiz" })


    }

    // 3) token ile gelen kullanıcının hesabı duruyor mu
    const activeUser = await User.findById(decoded.id)

    //3.1) hesap durmuyorsa hata gönder
    if (!activeUser) {
        return res.status(404).json({ message: "Kullanıcının hesabına erişilemiyor (tekrar kayıt olun)" })
    }
    if (!activeUser.active) {
        return res.status(404).json({ message: "Kullanıcının hesabına dondurulmuş" })
    }

    // 4) tokeni verdikten sonra şifresini değiştirmiş mi kontrol et 
    if (activeUser.passChangedAt && decoded.iat) {
        const passChangedSeconds = parseInt(activeUser.passChangedAt.getTime() / 1000)

        if (passChangedSeconds > decoded.iat) {
            return res.status(403).json({
                message: "Yakın zamanda şifrenizi değiştirdiniz,Lütfen tekrar giriş yapın"
            })
        }

    }


    next()

}
