const Review = require("../models/reviewModel");

const c = require("../utils/catchAsync");

exports.getAllReviews = c(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({ message: "Yorumlar başarılı bir şekilde alındı", reviews });
});

exports.createReview = c(async (req, res, next) => {});

exports.getReview = c(async (req, res, next) => {});

exports.updateReview = c(async (req, res, next) => {});

exports.deleteReview = c(async (req, res, next) => {});
