const mongoose = require("mongoose")
const app = require("./app.js")
//.env dosyasındaki değişkenlere eriş
const env = require("dotenv").config()
//local mongodb veritabanına bağlan
mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("🎾 Veri tabanına bağlanıldı ")
}).catch((err) => {
    console.log("🙈 Veri Tabanına bağlanılamadı")
})

const port = process.env.PORT

app.listen(port, () => console.log(`🎾🎾 server ${port} portuna gelen istekleri dinlemeye başladıı.. 🎾🎾`))
