const express = require("express");
const { getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours } = require("../controllers/tourController.js")
const formattedQuery = require("../middleware/formatQuery")

const router = express.Router()

//routes
router.route("/top-tours").get(aliasTopTours, getAllTours)

router.route("/")
    .get(formattedQuery, getAllTours)
    .post(createTour)

router.route("/:id")
    .get(getTour)
    .delete(deleteTour)
    .patch(updateTour)



module.exports = router;
