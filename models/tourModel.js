const mongoose = require("mongoose");

// veri tabanına kaydedilecek olan verilerin kısıtlamalarını yazalım

const tourSchema = new mongoose.Schema({
    name: { type: String, unique: [true, "Bu isim zaten mevcut"], required: [true, "Tur isim değerine sahip olmalı"] },


    price: { type: Number, required: [true, "Tur fiyat değerine sahip olmalı"] },
    priceDiscount: {
        type: Number,

    },
    duration: {
        type: Number,
        required: [true, "Tur süre değerine sahip olmalı"]

    },
    difficulty: {
        type: String,
        required: [true, "Tur süre değerine sahip olmalı"],
        enum: ["easy", "medium", "hard", "dificult"]
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
        maxlength: [200, "Özet alanı 200 karekteri geçemez"]
    },
    description: {
        type: String,
        required: [true, "Tur açıklama değerine sahip olmalı"],
        maxlength: [1000, "Tur açıklama alanı 200 karekteri geçemez"]

    },
    imageCover: {

        type: String,
        required: [true, "tur kapak foğrafına sahip olmalı"]
    },
    images: {
        type: [String],
    },
    startDates: {
        type: [Date],
    }
},
    //şema ayarları

    { timestamps: true }



);



//şemayı kullanarak model oluşturuyouz

const Tour = mongoose.model("Tour", tourSchema);

//controller da kullanmak için model i export ettik

module.exports = Tour;
