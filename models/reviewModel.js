const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Yorum içeriği boş olmaz"],
    },

    rating: {
      type: Number,
      required: [true, "Yorum puan değerine sahip olmalı"],
      min: [1, "Rating değeri 1'den  küçük olamaz"],
      max: [5, "Rating değeri 5'ten büyük olamaz"],
      default: 4.0,
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Yorumun hangi kullanıcı attığını belirtin"],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Yorumun hangi tur için atıldığını belirtin"],
    },
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//Yapılan fin sorgularından önce kullanıcıların referanslarını gerçek veri kayıtları ile doldur
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name photo" });

  next();
});

//bir tur için turun rating ortalamasını hesaplayan bir fonksiyon yazalım

reviewSchema.statics.calcAverage = async function (tourId) {
  //aggreagate ile istatistk hesapla
  const stats = await this.aggregate([
    {
      //1)parametre olarak gelen turun  id'si ile eşleşen yorumları al

      $match: { tour: tourId },
    },
    {
      //2) toplam yorum sayısı ve yorumların ortalama değerini hesapla

      $group: {
        _id: "$tour",
        nRating: { $sum: 1 }, //toplam yorum sayısı
        avgRating: { $avg: "$rating" }, // ortalama rating
      },
    },
  ]);
  console.log(stats);
  //eğer tura atılan yorum varsa hesaplanan istatistikleri tur belgesine kaydet
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4,
      ratingsQuantity: 0,
    });
  }
};
//her yorum atıldığında / silindiğinde / güncellendiğinde yukarıdaki method çalıştırılıp güncel rating değerlerini hesapla tour belgesini güncelle

reviewSchema.post("save", function () {
  Review.calcAverage(this.tour);
});
reviewSchema.post(/^findOneAnd/, function (document) {
  Review.calcAverage(document.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
