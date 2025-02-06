const express = require("express");
const { getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan } = require("../controllers/tourController.js")
const formattedQuery = require("../middleware/formatQuery");
const { protect } = require("../controllers/authController.js");


const router = express.Router()

//routes
router.route("/top-tours").get(aliasTopTours, getAllTours)

router.route("/tour-stats").get(getTourStats)

router.route("/monthly-plan/:year").get(getMonthlyPlan)

router.route("/")
    .get(protect, formattedQuery, getAllTours)
    .post(createTour)

router.route("/:id")
    .get(getTour)
    .delete(deleteTour)
    .patch(updateTour)



module.exports = router;
