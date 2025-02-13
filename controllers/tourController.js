const mogoose = require("mongoose");
const Tour = require("../models/tourModel.js");
const APIFeatures = require("../utils/apiFeatures.js");
const e = require("../utils/error.js")
const c = require("../utils/catchAsync.js")

//istek parametrelerini frontendin oluşturması yerine mw ile biz tanımlayacağız

exports.aliasTopTours = async (req, res, next) => {
    req.query.sort = "-ratingsAverage,-ratingsQuantity";
    req.query["price[lte]"] = "1200";
    req.query.limit = 5;
    req.query.fields = "name,price,summary,difficulty,ratingsAverage";

    next()
}



exports.getAllTours = c(async (req, res, next) => {
    //class'tan örnek al (geriye soruguyu olulturup döndürür)

    const features = new APIFeatures(Tour.find(), req.query, req.formattedQuery)
        .filter()
        .limit()
        .sort()
        .pagination();


    //sorguyu çalıştır
    const tours = await features.query;

    // client 'a veritabanından gelen verileri gönder
    res.json({
        message: "getAllTours başarılı",
        results: tours.length,
        tours,
    });

});

exports.createTour = c(async (req, res, next) => {

    //veritabanına yeni turu kaydet
    const newTour = await Tour.create(req.body);

    //clien'a cevap gönder
    res.json({ message: "createTour başarılı", tour: newTour });

});

exports.getTour = c(async (req, res, next) => {

    const tour = await Tour.findById(req.params.id).populate("guides");

    res.json({ message: "getTour başarılı", tour });

});

exports.updateTour = c(async (req, res, next) => {

    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.json({ message: "UpdateTour başarılı", tour });

});

exports.deleteTour = c(async (req, res, next) => {

    await Tour.deleteOne({ _id: req.params.id });

    res.status(204).json({});

    res.json({ message: "deleteTour başarılı" });

});

//rapor oluşturup gönderecek
//zorluğa göre gruplandırarak istatistik hesapla

exports.getTourStats = c(async (req, res, next) => {

    //aggregation pipeline
    //Raporlama adımları

    const stats = await Tour.aggregate([
        //1.adım  ratingi 4 ve üzeri olan turları al
        {
            $match: { ratingsAverage: { $gte: 4.0 } }
        },

        //2.adım zorluğa göre gruplandır ve ortalama değerleri hesapla
        {
            $group: {
                _id: "$difficulty",
                count: { $sum: 1 },
                avgRating: { $avg: "$ratingsAverage" },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },

            },
        },

        //3.adım gruplanan veriyi fiyata göre sırala
        { $sort: { avgPrice: 1 } },

        //4.adım  fiyatı 500 den büyük olanları al

        { $match: { avgPrice: { $gte: 500 } } },




    ]);
    return res.status(200).json({ message: "Rapor oluşturuldu", stats })

}
)
//rapor oluşturulup gönderilecek
//belirli bir yıl için o yılın her ayında kaç tane ve hangi turlar başlayacak
exports.getMonthlyPlan = async (req, res, next) => {


    //parametre olarak gelen yılı al
    const year = Number(req.params.year)

    //raporu oluştur
    const stats = await Tour.aggregate(
        [
            {
                $unwind: {
                    path: "$startDates"
                }
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $month: "$startDates"
                    },
                    count: {
                        $sum: 1
                    },
                    tours: {
                        $push: "$name"
                    }
                }
            },
            {
                $addFields: {
                    month: "$_id"
                }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {
                    month: 1
                }
            }
        ]



    )
    if (stats.length === 0) {
        return next(e(404, `${year} yılına ait veri bulunamadı`))
    }
    res.status(200).json({ message: `${year} yılı için aylık plan oluşturuldu`, stats })





}
