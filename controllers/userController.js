const multer = require("multer");
const User = require("../models/userModel");
const c = require("../utils/catchAsync");
const error = require("../utils/error");
const filterObject = require("../utils/filterObject");
const factory = require("./handlerFactory");

//diskStorage kurulum(dosyaları disk'e kaydetmeye yarayacak)
const multerStorage = multer.diskStorage({
  // dosyanın yükleneceği klasorü belirle
  destination: function (req, file, cb) {
    cb(null, "public/img/users");
  },

  //dosyanın ismi
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

//multer kurulum(clien'tan gelen dosyalara erişmemizi sağlayacak)
const upload = multer({
  storage: multerStorage,
});

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
