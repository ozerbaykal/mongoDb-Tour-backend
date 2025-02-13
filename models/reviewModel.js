const mongoose = require("mongoose");

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

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
