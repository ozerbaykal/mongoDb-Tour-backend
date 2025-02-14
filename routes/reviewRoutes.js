const express = require("express");
const {
  getAllReviews,
  createReview,
  getReview,
  deleteReview,
  updateReview,
} = require("../controllers/reviewController");

const router = express.Router();

//routes
router.route("/").get(getAllReviews).post(createReview);

router.route("/:id").get(getReview).delete(deleteReview).patch(updateReview);

module.exports = router;
