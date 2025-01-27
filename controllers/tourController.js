const mogoose = require("mongoose")
const Tour = require("../models/tourModel.js")
exports.getAllTours = async (req, res) => {
    try {
        //veri tabanındaki tüm turları alır
        const tours = await Tour.find()

        res.json({ message: "getAllTours başarılı", tours })


    } catch (error) {
        res.status(500).json({ message: "getAllTours başarısız", error: error.message })

    }




};

exports.createTour = async (req, res) => {
    try {
        //veritabanına yeni turu kaydet
        const newTour = await Tour.create(req.body)

        //clien'a cevap gönder
        res.json({ message: "createTour başarılı", tour: newTour })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "createTour başarısız" })

    }



};

exports.getTour = async (req, res) => {

    try {
        const tour = await Tour.findById(req.params.id)




        res.json({ message: "getTour başarılı", tour })


    } catch (error) {
        res.status(400).json({ message: "getTour başarısız" })

    }
};

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.json({ message: "UpdateTour başarılı", tour })

    } catch (error) {

        res.status(400).json({ message: "UpdateTour başarısız", error: error.message })

    }


};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.deleteOne({ _id: req.params.id })

        res.status(204).json({})



        res.json({ message: "deleteTour başarılı" })


    } catch (error) {

    }


};