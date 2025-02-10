const express = require("express");
const { getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan } = require("../controllers/tourController.js")
const formattedQuery = require("../middleware/formatQuery");
const { protect, restrictTo } = require("../controllers/authController.js");


const router = express.Router()

//routes
router.route("/top-tours").get(aliasTopTours, getAllTours)

router.route("/tour-stats").get(protect, restrictTo("admin"), getTourStats)

router.route("/monthly-plan/:year").get(protect, restrictTo("admin"), getMonthlyPlan)

router.route("/")
    .get(formattedQuery, getAllTours)
    .post(protect, restrictTo("admin", "lead-guide"), createTour)

router.route("/:id")
    .get(getTour)
    .delete(restrictTo("admin", "lead-guide"), protect, deleteTour)
    .patch(protect, restrictTo("admin", "lead-guide,guide"), updateTour)



module.exports = router;
