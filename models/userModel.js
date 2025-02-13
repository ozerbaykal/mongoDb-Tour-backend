//kullanıcı Şeması 

const { Schema, default: mongoose } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt")
const crypto = require("crypto")

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
    passwordConfirm: {
        type: String,
        required: [true, "Lütfen şifrenizi onaylayın"],
        validate: {
            validator: function (value) {
                return value === this.password;

            },
            message: " Onay şifresi eşlenmiyor"
        }

    },


    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user",
    },
    active: {
        type: Boolean,
        default: true,
    },

    passChangedAt: {
        type: Date
    },
    passResetToken: String,

    passResetExpires: Date,



})
//veri tabanına kullanıcıyı kaydetmeden önce passwordConfirm alanını kaldır;
//password alanını şifreleme algoritmaları ile şifrele

userSchema.pre("save", async function (next) {
    // "save" kullanıcı belgesi her güncellendiğinde çalışır ama parola değişmediyse aşağıdaki kodlar çalışmamalı.
    if (!this.isModified("password")) {
        return next()

    }

    //şifreyi salt ve hashle
    this.password = await bcrypt.hash(this.password, 12)


    //1.  $2b$12$XMRZn5/W0rVY3btNJ7L.6uQy6zCECOIdrMC.AUkXAQVf0X4Clt0Gi
    //2.  $2b$12$4A5N47WQ9UEHHK1rLTGPj.N1LIhiTimqJ5OFuddGk9wH2gdAV.c1i
    //onay şifresini kaldır
    this.passwordConfirm = undefined

    next()
})

//?Veri tabanına kullanıcıyı güncellemeden önce
//Eğer şifre değiştiyse şifre değişim tarihini güncelle
userSchema.pre("save", function (next) {
    //eğer şifre değişmediyse veya döküman yeni oluşturulduysa mw'i durdur sonraki adıma devam et
    if (!this.isModified("password") || this.isNew) return next()


    //şifre yeni değiştiyse şifre değişim tarihini belirle
    //şifre değişiminden hemen sonra  jwt token i oluşturduğumuz için  oluşturulma tarihi çakışmasın diye 1sn çıkaralım
    this.passChangedAt = Date.now() - 1000;

    next()

})

//? Kullanıcı veri tabanından alınmaya çalıştığında active değeri false olanları kaldır

userSchema.pre(/^find/, function (next) {
    //yapılan sorgudan hesabı inaktif olanları kaldır
    this.find({ active: { $ne: false } })
    next()
})




//?sadece model üzerinden erişilebilen  fonksiyon
// normal şifre ile haslenmiş şifreyi userSchema ya model olarak ekledik
userSchema.methods.correctPass = async function (pass, hashedPass) {
    return await bcrypt.compare(pass, hashedPass)
};

// şifre sıfırlama token i oluşturan fonksiyon
userSchema.methods.createResetToken = function () {
    //1)32 byte'lik  rastgele bir  veri oluştur ve bunu hexadecimal bir diziyee dönüştür
    const resetToken = crypto.randomBytes(32).toString("hex")
    //2)token i hasle ve veritabanına kaydet
    this.passResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    //3)tokenin son geçerlilik tarihini veritabanına akydet (10dk)
    this.passResetExpires = Date.now() + 10 * 60 * 1000;

    //4)tokenin normal halini return et
    return resetToken;
}

const User = mongoose.model("User", userSchema)

module.exports = User;

