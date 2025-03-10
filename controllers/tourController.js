const Tour = require("../models/tourModel.js");
const APIFeatures = require("../utils/apiFeatures.js");
const e = require("../utils/error.js");
const c = require("../utils/catchAsync.js");
const { default: mongoose } = require("mongoose");
const factory = require("./handlerFactory.js");

//istek parametrelerini frontendin oluşturması yerine mw ile biz tanımlayacağız

exports.aliasTopTours = async (req, res, next) => {
  req.query.sort = "-ratingsAverage,-ratingsQuantity";
  req.query["price[lte]"] = "1200";
  req.query.limit = 5;
  req.query.fields = "name,price,summary,difficulty,ratingsAverage";

  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.createTour = factory.createOne(Tour);

exports.getTour = factory.getOne(Tour, "reviews");

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

//rapor oluşturup gönderecek
//zorluğa göre gruplandırarak istatistik hesapla
exports.getTourStats = c(async (req, res, next) => {
  //aggregation pipeline
  //Raporlama adımları

  const stats = await Tour.aggregate([
    //1.adım  ratingi 4 ve üzeri olan turları al
    {
      $match: { ratingsAverage: { $gte: 4.0 } },
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
  return res.status(200).json({ message: "Rapor oluşturuldu", stats });
});
//rapor oluşturulup gönderilecek
//belirli bir yıl için o yılın her ayında kaç tane ve hangi turlar başlayacak
exports.getMonthlyPlan = async (req, res, next) => {
  //parametre olarak gelen yılı al
  const year = Number(req.params.year);

  const stats = await Tour.aggregate([
    {
      $unwind: {
        path: "$startDates",
      },
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$startDates",
        },
        count: {
          $sum: 1,
        },
        tours: {
          $push: "$name",
        },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);
  if (stats.length === 0) {
    return next(e(404, `${year} yılına ait veri bulunamadı`));
  }
  res.status(200).json({ message: `${year} yılı için aylık plan oluşturuldu`, stats });
};

//belirli kooridnlatlardaki turları filtrele

exports.getToursWithin = c(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  //enlem ve boylamı  değişkene aktar
  const [lat, lng] = latlng.split(",");
  //merkez noktası gönderilmediyse hata fırlat
  if (!lat || !lng) return next(e(400, "Lütfen merkez koordinatlarını belirleyin"));

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  //belirlenen dairesel alandaki turları filtrele
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lat, lng], radius],
      },
    },
  });

  //clien a cevap gönder
  res.status(200).json({ message: "Girilen sınırlar içirisindeki turlar alındı", tours });
});

//uzaklık hesaplama

exports.getDistances = c(async (req, res, next) => {
  //url deki parametrelere eriştik
  const { latlng, unit } = req.params;
  //enlem boylamı ayır

  const [lat, lng] = latlng.split(",");

  //enlem ve boylam yoksa hata fırlat
  if (!lat || !lng) return next(e(400, "Lütfen merkez noktayı tanımlayın"));

  //unit e göre radyanı doğru formata çevirmek için kaçla çarpmalıryız ?
  const multiplier = unit === "mi" ? 0.000621371192 : 0.001;

  //turların merkez noktadan uzaklıklarını hesapla
  const distances = await Tour.aggregate([
    //1) uzaklığı hesapla
    {
      $geoNear: {
        near: { type: "Point", coordinates: [+lat, +lng] },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    //nesneden istediğimiz değerleri seç
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  console.log(latlng, unit);
  res.status(200).json({ message: " aradığınız tura olan mesafeniz bulundu", distances });
});
