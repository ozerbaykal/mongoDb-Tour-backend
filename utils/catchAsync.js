//Asenkoron fonkisyonlarda hatayı yakalayan bir fonksiyon yazalım
//Çalıştırmak istediğimiz fonksiyonu parametre olarak alacak ardından try catch bloğunda bu fonksiyonu çalıştıracak hata olursa hata mw 'e yönlendirecek

module.exports = (fn) => {

    return (req, res, next) => {
        fn(req, res, next).catch(next)
    }
}