
const express = require("express")

const tourRouter = require("./routes/tourRoutes.js")
const userRouter = require("./routes/userRoutes.js")
const reviewRouter = require("./routes/reviewRoutes.js");
const cookieParser = require("cookie-parser");
const error = require("./utils/error.js");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet")

//express uygulması oluştur
const app = express();

//rate limit : aynı ip adresinden belirli bir süre içerisinde gelen istek sınırını belirle

const limiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000,
    message: "Kısa süre içerisinde çok fazla istekte bulunduz.Lütfen daha sonra  tekrar deneyiniz"

});



//express in body bölümünde gelen verilere erişmemizi sağlan middleware

app.use(helmet())

app.use("/api", limiter)

app.use(express.json({ limit: "10kb" }));

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
