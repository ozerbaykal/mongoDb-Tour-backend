//aldığı statusCode ve message parametrelerine bağlı hat üretsin

const error = (statusCode, message) => {
    //bir error nesnesi oluşur
    const err = new Error(message);

    //hata nesnesini güncelle
    err.statusCode = statusCode

    //hata nesnesini döndür
    return err;

}

module.exports = error;