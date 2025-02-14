const Review = require("../models/reviewModel");

const c = require("../utils/catchAsync");

exports.getAllReviews = c(async (req, res, next) => {
  // /api/reviews >> bütün yorumları getir
  // /api/tours/:tourId/reviews  >> id li tour un yorumlarını getir
  let filters = {};

  if (req.params.tourId) filters = { tour: req.params.tourId };

  const reviews = await Review.find(filters);

  res.status(200).json({ message: "Yorumlar başarılı bir şekilde alındı", reviews });
});

exports.createReview = c(async (req, res, next) => {
  //eğer ki atılan isteğin body kısmında turun id'si varsa onu kullan yoksa ozaman isteğin parametre kısmında gelen tur id'sini kullan
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;

  const newReview = await Review.create(req.body);

  res.status(201).json({ message: "yorum başarılı", newReview });
});

exports.getReview = c(async (req, res, next) => {});

exports.updateReview = c(async (req, res, next) => {});

exports.deleteReview = c(async (req, res, next) => {});
