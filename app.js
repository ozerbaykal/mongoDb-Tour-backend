
const express = require("express")

const tourRouter = require("./routes/tourRoutes.js")
const userRouter = require("./routes/userRoutes.js")
const reviewRouter = require("./routes/reviewRoutes.js");
const cookieParser = require("cookie-parser");
const error = require("./utils/error.js")
//express uygulması oluştur
const app = express();

//express in body bölümünde gelen verilere erişmemizi sağlan middleware
app.use(express.json());

app.use(cookieParser());

//routerları projeye tanıt

app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);
app.use("/api/reviews", reviewRouter);


// tanımlanmayan bir route'a istek atıldığında hata ver

app.all("*", (req, res, next) => {
    //eski yöntem
    //res.status(404).json({ message: "İstek attığınız yol mevcut değil" })
    const err = error(404, "İstek attığınız yol mevcut değil")
    //yeni yöntem
    next(err)
})

//hata olduğunda devreye giren mw

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || "fail"
    err.message = err.message || "Üzgünüz bir hata meydana geldi"

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    })

})



module.exports = app;
