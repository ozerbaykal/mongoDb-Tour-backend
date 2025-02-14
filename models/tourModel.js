const mongoose = require("mongoose");
const validator = require("validator");

// veri tabanına kaydedilecek olan verilerin kısıtlamalarını yazalım

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "Bu isim zaten mevcut"],
      required: [true, "Tur isim değerine sahip olmalı"],
      // validate: [validator.isAlphanumeric, "Tur isminde özel karakter içermemeli"],
    },

    price: { type: Number, required: [true, "Tur fiyat değerine sahip olmalı"] },
    priceDiscount: {
      type: Number,
      //custom validator(kendi yazdığımız kontrol methodları)
      //doğrulama fonsksiyonları false return ederse doğrulamadan geçmedi anlamında gelir ve belge veritabanına kaydedilmez true return ederse doğrulamadan geçti anlamına gelir

      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: "indirim fiyatı asıl fiyattan büyük olamaz",
      },
    },
    duration: {
      type: Number,
      required: [true, "Tur süre değerine sahip olmalı"],
    },
    difficulty: {
      type: String,
      required: [true, "Tur süre değerine sahip olmalı"],
      enum: ["easy", "medium", "hard", "dificult"],
    },

    MaxGroupSİze: {
      type: Number,
      required: [true, "Tur max kişi sayısına sahip olmalı"],
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating değeri 1'den  küçük olamaz"],
      max: [5, "Rating değeri 5'ten büyük olamaz"],
      default: 4.0,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      required: [true, "Tur özet alanına sahip olmalı"],
      maxlength: [200, "Özet alanı 200 karekteri geçemez"],
    },
    description: {
      type: String,
      required: [true, "Tur açıklama değerine sahip olmalı"],
      maxlength: [1000, "Tur açıklama alanı 200 karekteri geçemez"],
    },
    imageCover: {
      type: String,
      required: [true, "tur kapak foğrafına sahip olmalı"],
    },
    images: {
      type: [String],
    },
    startDates: {
      type: [Date],
    },

    //embdedding
    startLocation: {
      description: String,
      type: { type: String, default: "Point", enum: "Point" },
      coordinates: [Number],
      address: String,
    },

    //embdedding
    locations: {
      description: String,
      type: { type: String, default: "Point", enum: "Point" },
      coordinates: [Number],
      day: Number,
    },

    //refferance
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User", // id'lerin hangi koleksiyona ait olduğunu söyledik
      },
    ],
  },
  //şema ayarları

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
//!Virtual Populate
tourSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id", //review dökümanındaki "tour" alanının tour dökümanındaki karşılığı olan alan
  foreignField: "tour", // "tour" dökümanındaki "_id" alanının yorum dökümanındaki karşılığı
});

//!Virtual Property

//Şuan veritabanında tutarların fiyatlarını ve indirim fiyatını tutuyoruz ama frontend bizden ayrıca indirimli fiyatıda istedi.Bu durumda indirimli fiyatları veri tabanında tutmak gereksiz maaliyey olur.Bunun yerine cevap gönderme sırasında bu değerleri hesaplayıp eklersek hem frontend in ihtiyacı karşılanır hemde veri tabanında gereksiz yer kaplamaz.Bunu VİrtualProperty ile yapıyoruz.

tourSchema.virtual("discountedPrice").get(function () {
  return this.price - this.priceDiscount;
});

//Şuan veritabanında tur ismini tutuyoruz ama client ekstra olarak slug istedi
tourSchema.virtual("slug").get(function () {
  return this.name.replaceAll(" ", "-").toLowerCase();
});

//!Document Middleware

//Bir belgenin kaydedilme,güncelleme,silinme okuma gibi olaylardan önce veya sonra işlem grçekleştirmke istiyorsak kullanırız.
//Örn;CLient'tan gelen tur verisinin veri tabanına kaydedilmeden önce kaç saat sürdüğünü hesaplayalım
tourSchema.pre("save", function (next) {
  //gerekli işlemleri yap
  this.durationHour = this.duration * 24;
  next();
});

//?pre()işlemden önce post() işelemden sonra mw i çalıştırır

tourSchema.post("updateOne", function (doc, next) {
  //kullanıcının şifresini güncellemesinden sonra haber veya doğrulama mail i gönderir

  next();
});
//! Query Middleware
//sorgudan önce veya sonra çalıştırdığımız mw lerdi
tourSchema.pre("find", function (next) {
  //premium olanları gödnermek istemediğimizde yapılan sorgularda otomatik premium olmayanları filtreleyelim
  this.find({ premium: { $ne: true } });
  next();
});

//? Turlar veri tabanından alınmaya çalıştığında
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-password -__v -passResetToken -passResetExpires -passChangedAt",
  });
  next();
});

//! Aggregate Middleware
//rapor oluştruma işlemlerinden önce veya sonra çalıştırdığımız mw dir
tourSchema.pre("aggregate", function (next) {
  //premium olan turlar rapora dahil edilmesin
  this.pipeline().unshift({ $match: { premium: { $ne: true } } });
  next();
});

//şemayı kullanarak model oluşturuyouz

const Tour = mongoose.model("Tour", tourSchema);

//controller da kullanmak için model i export ettik

module.exports = Tour;
