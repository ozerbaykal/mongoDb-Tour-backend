
const express = require("express")

const tourRouter = require("./routes/tourRoutes.js")
const userRouter = require("./routes/userRoutes.js")
const reviewRouter = require("./routes/reviewRoutes.js")

//express uyggulması oluştur
const app = express();

//express in body bölümünd gelen verilere erişmemizi sağlan middleware

app.use(express.json())

//routerları projeye tanıt

app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);
app.use("/api/reviews", reviewRouter);



module.exports = app;
