const Review = require("../models/reviewModel");

const c = require("../utils/catchAsync");
const factory = require("./handlerFactory");

// CreateReview controller in dan önce çalışacak olan MW
exports.setRefIds = (req, res, next) => {
  //eğer ki atılan isteğin body kısmında turun id'si varsa onu kullan yoksa ozaman isteğin parametre kısmında gelen tur id'sini kullan
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
};

exports.getAllReviews = factory.getAll(Review);

exports.createReview = factory.createOne(Review);

exports.getReview = factory.getOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
