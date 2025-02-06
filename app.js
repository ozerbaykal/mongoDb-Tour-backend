
const express = require("express")

const tourRouter = require("./routes/tourRoutes.js")
const userRouter = require("./routes/userRoutes.js")
const reviewRouter = require("./routes/reviewRoutes.js");
const cookieParser = require("cookie-parser");

//express uygulması oluştur
const app = express();

//express in body bölümünde gelen verilere erişmemizi sağlan middleware
app.use(express.json());

app.use(cookieParser());

//routerları projeye tanıt

app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);
app.use("/api/reviews", reviewRouter);



module.exports = app;
