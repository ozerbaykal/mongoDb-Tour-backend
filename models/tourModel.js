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

    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }



);

//!Virtual Property

//Şuan veritabanında tutarların fiyatlarını ve indirim fiyatını tutuyoruz ama frontend bizden ayrıca indirimli fiyatıda istedi.Bu durumda indirimli fiyatları veri tabanında tutmak gereksiz maaliyey olur.Bunun yerine cevap gönderme sırasında bu değerleri hesaplayıp eklersek hem frontend in ihtiyacı karşılanır hemde veri tabanında gereksiz yer kaplamaz.Bunu VİrtualProperty ile yapıyoruz.

tourSchema.virtual("discountedPrice").get(function () {
    return this.price - this.priceDiscount
});

//Şuan veritabanında tur ismini tutuyoruz ama client ekstra olarak slug istedi
tourSchema.virtual("slug").get(function () {
    return this.name.replaceAll(" ", "-").toLowerCase()


})



//şemayı kullanarak model oluşturuyouz

const Tour = mongoose.model("Tour", tourSchema);

//controller da kullanmak için model i export ettik

module.exports = Tour;
