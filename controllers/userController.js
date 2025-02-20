const multer = require("multer");
const User = require("../models/userModel");
const c = require("../utils/catchAsync");
const error = require("../utils/error");
const filterObject = require("../utils/filterObject");
const factory = require("./handlerFactory");
const sharp = require("sharp");

//diskStorage kurulum(dosyaları disk'e kaydetmeye yarayacak)
// const multerStorage = multer.diskStorage({
//   // dosyanın yükleneceği klasorü belirle
//   destination: function (req, file, cb) {
//     cb(null, "public/img/users");
//   },

//   //dosyanın ismi
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

//memory storoge kurulumu( resimleri buffer veri tipinde  Ram de sakla)
const multerStorage = multer.memoryStorage();

//fotoğraf dışında veri tiplerini kabul etmeyen mw
const multerFilter = (req, file, cb) => {
  //eğer dosya tipi resim ise kabul et
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    //resim değilse hata fırlat
    cb(new Error("Dosya tipi sadece resim olabilir(jpg,jpeg,png...)"));
  }
};

//multer kurulum(clien'tan gelen dosyalara erişmemizi sağlayacak)
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//kullanıcı 4k çözünürlükte 30-40mb bir fotografı profil fotoğrafı olarak yüklemeye çalışabilir.
//Proje içerisinde profil fotografları genelde 40x40 veya 80x80 boyutlandırılarak kullanılır ama kullanıcı fotografı secerken 2560x1680 gibi yüksek kalite fotograf secebilir ve herhangi bir işlemden geçmeden önce sunucuya kaydedersek gereksiz yer kaplar.Bu yüzden yüklenecek fotografın çzöünürlüğü projedeki max boyuta indireceğiz

exports.resize = (req, res, next) => {
  //eğer dosya yoksa yeniden boyutlandırma yapma ve sonraki adıma geç
  if (!req.file) return next();

  //işlenmiş dosya ismini belirle
  const filename = `user-${req.user.id}-${Date.now()}.webp`;

  //dosyayı işle ve yükle
  sharp(req.file.buffer) //buffer veritipindeki resmi alır
    .resize(200, 200) //yeniden boyutlandırma yapar
    .toFormat("webp") //dosya formatını değiştirir
    .webp({ quality: 70 }) //resmin kalitesini %70 e çeker
    .toFile(`public/img/users/${filename}`); //dosyayı diske kaydeder
  next();
};

//dosyalara erişecek olan mw
exports.uploadUserPhoto = upload.single("avatar");

//kullanıcının bilgilerini güncelle
exports.updateMe = c(async (req, res, next) => {
  //1) şifre güncellemeye çalışırsa hata ver
  if (req.body.password || req.body.passwordConfirm) {
    return next(error(404, "Şifreyi bu  endpoint ile güncelleyemezsiniz "));
  }
  //2) istedğin body kısmında sadece izin verilen değerleri al
  const filteredBody = filterObject(req.body, ["name", "email", "photo"]);

  //2.1 eğer isteğin içerisinde avatar değeri varsa güncellenecek olan  verilerin arasına url'i ekle
  if (req.file) filteredBody.photo = req.file.filename;

  //3)kullancı  bilgilerini güncelle
  const updated = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true });

  //4)client' a cevap gönder
  res
    .status(200)
    .json({ message: "Bilgileriniz başarılı bir şekilde güncellendi ", updated });
});
exports.deleteMe = c(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({ message: "Hesabınız başarıyla kaldırıldı" });
});
exports.getAllUsers = factory.getAll(User);

exports.createUser = factory.createOne(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
