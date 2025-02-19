const express = require("express");
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} = require("../controllers/tourController.js");
const formattedQuery = require("../middleware/formatQuery");
const { protect, restrictTo } = require("../controllers/authController.js");
const reviewController = require("../controllers/reviewController.js");

const router = express.Router();

//routes
router.route("/top-tours").get(aliasTopTours, getAllTours);

router.route("/tour-stats").get(protect, restrictTo("admin"), getTourStats);

router.route("/monthly-plan/:year").get(protect, restrictTo("admin"), getMonthlyPlan);

router
  .route("/")
  .get(formattedQuery, getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);

router
  .route("/:id")
  .get(getTour)
  .delete(protect, restrictTo("lead-guide", "admin"), deleteTour)
  .patch(protect, restrictTo("admin", "lead-guide,guide"), updateTour);

// Nested Routes
//POST /api/tours/123456/reviews > tura yeni bir yorum ekle
//GET /api/tours/123456/reviews > tura ait olan bütün yorumaları al
//GET /api/tours/123456/reviews/123456778 >tura ait olan yorumaların arasından belirli id'li yorum al
router
  .route("/:tourId/reviews")
  .get(reviewController.getAllReviews)
  .post(protect, reviewController.setRefIds, reviewController.createReview);

//coğrafi filtreleme
router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(getToursWithin);

//uzaklık hesaplama

router.route("/distances/:latlng/unit/:unit").get(getDistances);

module.exports = router;
