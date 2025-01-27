const mongoose = require("mongoose");

// veri tabanına kaydedilecek olan verilerin kısıtlamalarını yazalım

const tourSchema = new mongoose.Schema({
    name: { type: String, unique: [true, "Bu isim zaten mevcut"], required: [true, "Tur isim değerine sahip olmalı"] },
    rating: {
        type: Number,
        min: [1, "Rating değeri 1'den  küçük olamaz"],
        max: [5, "Rating değeri 5'ten büyük olamaz"],
        default: 4.0,
    },
    price: { type: Number, required: [true, "Tur fiyat değerine sahip olmalı"] },

    MaxGroupSİze: {
        type: Number,
        required: [true, "Tur max kişi sayısına sahip olmalı"],
    },
});

//şemayı kullanarak model oluşturuyouz

const Tour = mongoose.model("Tour", tourSchema);

//controller da kullanmak için model i export ettik

module.exports = Tour;
