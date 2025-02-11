const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const e = require("../utils/error.js");
const sendMail = require("../utils/sendMail.js");
const crypto = require("crypto")


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
exports.signUp = async (req, res, next) => {
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

        next(e(500, error.message))


    }
};

//>>>>>>>>>>>>>>>giriş yap
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        //1)email ve şifre geldimi kontrol et
        if (!email || !password) {
            //return res.status(400).json({ message: "Lütfen mail ve şifre giriniz" })
            return next(e(400, "Lütfen mail ve şifre giriniz"))
        }

        //2)client 'tan gelen email ile kayıtlı kullanıcı var mı kontrol et
        const user = await User.findOne({ email })

        //2.1)kayıtlı kullanıcı yoksa hata fırlat
        if (!user) {

            return next(e(404, "Girdiğiniz mail kayıtlı kullancı bulunamadı"))

        }

        //3)client'tan gelen şifre ile veritabanında saklanan haslenmiş şifre ile eşleniyor mu kontrol et
        const isValid = await user.correctPass(password, user.password)

        //3.1) şifre yanlışssa hata fırlat

        if (!isValid) {
            return next(e(403, "şifreniz  hatalı,lütfen geçerli bir şifre girin"))

        }

        //4) jwt token i oluşturup gönder
        createSendToken(user, 200, res)

    } catch (error) {
        next(e(403, error.message))

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




//? >>>>>>>>>>>> Authorization MW <<<<<<<<<<<<<

// 1)Client'ın gönderdiği tokenin geçerliliğini doğrulayıp;
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
        next(e(403, "Bu işlem için yetkiniz yok (jwt gönderilmedi)"))

    }

    // 2) token geçerliliğini doğrulunu kontrol et(zaman aşımına uğradımı / imza doğrumu )
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);

    } catch (error) {
        if (error.message === "jwt expired") {
            next(e(403, "Oturumunuzun süresi doldu(tekrar giriş yapın)"))


        }
        next(e(403, "Gönderilen token geçersiz"))



    }

    // 3) token ile gelen kullanıcının hesabı duruyor mu
    let activeUser
    try {
        activeUser = await User.findById(decoded.id)

    } catch (error) {
        next(e(403, "Gönderilen token geçersiz"))

    }

    //3.1) hesap durmuyorsa hata gönder
    if (!activeUser) {
        next(e(403, "Kullanıcının hesabına erişilemiyor (tekrar kayıt olun)"))

    }
    if (!activeUser?.active) {
        next(e(403, "Kullanıcının hesabına dondurulmuş"))
    }

    // 4) tokeni verdikten sonra şifresini değiştirmiş mi kontrol et 
    if (activeUser?.passChangedAt && decoded.iat) {
        const passChangedSeconds = parseInt(activeUser.passChangedAt.getTime() / 1000)

        if (passChangedSeconds > decoded.iat) {
            next(e(403, "Yakın zamanda şifrenizi değiştirdiniz,Lütfen tekrar giriş yapın"))

        }

    }

    // mw den'den sonra çalışacak olan bütün mw ve methodlara aktüf kullanıcı verisini gönder
    req.user = activeUser


    next()

}


// 2) Berlirli roldeki kullanıcıların route'a erişimine izin verirken diğerlerini engelleyen mw

exports.restrictTo = (...roles) => (req, res, next) => {

    //a)mevcut kullanıcının kodu izin verilen roller arasında değilse hata gönder
    if (!roles.includes(req.user.role)) {
        return next(e(403, "Bu işlem için yetkiniz yok(rolunüz yetersiz)"))

    }
    //b) kullanıcının rolü yeterli ise devam et



    next()
}

// >>>>>>>>>>>> Authorization MW <<<<<<<<<<<<<


//? -------------- Şifre Sıfırlma -----------------

//  ---- Şifremi Unuttum -----

// a) Eposta adresine şifre sıfırlama bağlantısını gönder
exports.forgotPassword = async (req, res, next) => {
    // 1)epostaya göre kullanıcı hesabına eriş
    const user = await User.findOne({ email: req.body.email })
    // 1.1)kullanıcı yoksa hata gönder
    if (!user) {
        return next(e(404, "Bu mail adresine kayıtlı kullanıcı bulunamadı"))
    }

    //2) şifre sıfırlama token i oluştur
    const resetToken = user.createResetToken();


    //3 güncellenmeleri veri tabanına kaydet
    await user.save({ validateBeforeSave: false })

    //4)kullanıcının mail adresine tokeni link olarak gönder

    const url = `${req.protocol}://${req.headers.host}/api/users/reset-password/${resetToken}`;
    sendMail({
        email: user.email,
        subject: "Şifre sıfırlama bağlantısı (10dk)",
        text: resetToken,
        html: `
        <h2>Merhaba ${user.name}</h2>
        <p><b>${user.email}</b> eposta adresine bağlı tourify hesabınız için şfre sıfırlama bağlantısı
        aşağıdadır </p>
        <a href=${url}">${url}</a>
        <p>Yeni şifre ile birlikte yukarıdaki bağlantıya <i>PATCH</i> isteği atınız</p>
        <p><b><i>Tourify Ekibi</i></b></p>
        
        `,



    })

    //5)client e cevap gönder
    res.status(201).json({ message: "eposta gönderildi" })

}

// b) Yeni belirlenen şifreyi kaydet

exports.resetPassword = async (req, res, next) => {
    //1) tokendan yola çıkarak kullncıyı bul
    const token = req.params.token
    //2) elimizdeki token normal  token olduğu için ve veritabanında haslenmiş hali saklandığı için bunları karşılaştırabilmek için elimizdeki tokeni hasleyip veritabanına aktarmalıyız

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    //3) haslenmiş  token'la ilişkili kullanıcıyı al
    //3.1) son geçerlilik tarihinin dolmadığını kontrol et
    const user = await User.findOne({
        passResetToken: hashedToken,
        passResetExpires: { $gt: Date.now() },
    })
    //4) token geçersiz veya süresi dolmuşssa hata gönder
    if (!user) {
        return next(e(403, "Tokenin süresi dolmuş veya geçersiz"));
    }

    //5) kullanıcını bilgilerini güncelle
    user.password = req.body.newPass;
    user.passwordConfirm = req.body.newPass;
    user.passResetToken = undefined;
    user.passResetExpires = undefined;

    await user.save()


    //6)Client a cevap gönder
    res.status(200).json({ message: "şifreniz başarılıyla  güncellendi" })

}


//  ---- Şifremi Değiştirmek istiyorum -----

//kullnıcı şifresini hatırlamak ve güncelemek istiyorsa

exports.updatePassword = async (req, res, next) => {
    //1) Kullanıcının bilgilerini al
    const user = await User.findById(req.user.id)


    //2) Gelen mevcut şifre mevcut mu kontrol et

    if (!(await user.correctPass(req.body.currentPass, user.password))) {
        return next(e(400, "Girdiğiniz mevcut şifre hatalı"))
    }

    //3) doğru ise yeni şifreyi kaydet
    user.password = req.body.newPass;
    user.passwordConfirm = req.body.newPass

    await user.save();

    //4) (opsiyonel) bilgilendirme maili gönder
    await sendMail({
        email: user.email,
        subject: "Tourify Hesabı Şifreniz Güncellendi",
        text: "Bilgilendirme Maili",
        html: `
      <h1>Hesap Bilgileriniz Güncellendi</h1>
      <p>Merhaba, ${user.name}</p>
      <p>Hesap şifrenizin başarıyla güncellendiğini bildirmek isteriz. Eğer bu değişikliği siz yapmadıysanız veya bir sorun olduğunu düşünüyorsanız, lütfen hemen bizimle iletişime geçin.</p>
      <p>Hesabınızın güvenliğini sağlamak için şu adımları izleyebilirsiniz:</p>
      <ul>
        <li>Şifrenizi değiştirin.</li>
        <li>Hesabınızda tanımlı giriş noktalarını kontrol edin.</li>
        <li>İki faktörlü kimlik doğrulamayı aktif hale getirin.</li>
      </ul>
      <p>Teşekkürler,</p>
      <p><i><b>Tourify Ekibi</b></i></p>
        `,
    });


    //5) (opsiyonel) tekrar giriş yapması için token oluşturma 
    createSendToken(user, 200, res)







    res.status(201).json({ message: "Parolanız güncellendi" })



}



