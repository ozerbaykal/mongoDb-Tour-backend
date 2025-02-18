const APIFeatures = require("../utils/apiFeatures");
const c = require("../utils/catchAsync");

// Bİr belgeyi  silme işlemi proje içerisinde model ismi değiştirilerek  defalarca kullanıp gereksiz kod tekrarına sebep oluyordu bundan dolayı kod tekrarına düşmemek  için fonksiyon yazdık
//Dışarıdan parametre olarak aldığı model'e göre gerekli işlmeler yapar

//Silme
exports.deleteOne = (Model) =>
  c(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id);
    res.status(204).json({});
  });

//Güncelleme

exports.updateOne = (Model) =>
  c(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "Belge başarıyla güncellendi", data: document });
  });

//oluşturma

exports.createOne = (Model) =>
  c(async (req, res, next) => {
    const newDocument = await Model.create(req.body);
    res.status(201).json({ message: "Belge başarıyla oluşturuldu", data: newDocument });
  });

//bir tane al

exports.getOne = (Model, populateOptions) =>
  c(async (req, res, next) => {
    //sorguyu oluştur
    let query = Model.findById(req.params.id);

    //eğer  populate parametresi geldiyse sorguya ekle

    if (populateOptions) query = query.populate(populateOptions);

    //sorguyu çalıştır

    const document = await query;

    res.json({ message: "Belge başarıyla alındı", data: document });
  });

//bütün dökümanları al (filtrele - sıralama)

exports.getAll = (Model) =>
  c(async (req, res, next) => {
    // /api/reviews >> bütün yorumları getir
    // /api/tours/:tourId/reviews  >> id li tour un yorumlarını getir
    let filters = {};

    if (req.params.tourId) filters = { tour: req.params.tourId };

    //class'tan örnek al (geriye soruguyu olulturup döndürür)
    const features = new APIFeatures(Model.find(filters), req.query, req.formattedQuery)
      .filter()
      .limit()
      .sort()
      .pagination();

    //sorguyu çalıştır
    const documents = await features.query;

    // client 'a veritabanından gelen verileri gönder
    res.json({
      message: "Belgeler başarıyla alındı",
      results: documents.length,
      data: documents,
    });
  });
