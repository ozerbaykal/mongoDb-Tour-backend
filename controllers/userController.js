//kayıt Ol
exports.signUp = async (req, res) => {
    try {

        res.status(201).json({ message: "Kayıt olundu", })

    } catch (error) {

        res.status(500).json({ message: "Üzgünüz bir sorun oluştu" })

    }
}

//giriş yap
exports.login = async (req, res) => {
    try {

        res.status(201).json({ message: "giriş yapıldı", })

    } catch (error) {

        res.status(500).json({ message: "Üzgünüz bir sorun oluştu" })

    }
}

//çıkış yap

exports.logout = (req, res) => {
    try {

        res.status(201).json({ message: "Çıkış yapıldı", })

    } catch (error) {

        res.status(500).json({ message: "Üzgünüz bir sorun oluştu" })

    }
}