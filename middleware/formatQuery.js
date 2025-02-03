module.exports = (req, res, next) => {
    //url den gelen parametre >>>> {duration :{lt :'14'},price:{gte:'497'}}
    //mongo db nin isteği format >>>> {duration :{$lt :'14'},price:{$gte:'497'}} filtreleme parametrelerinin başında $ işaretir gerekiyor 

    //1.istek ile gelen parametrelere eriş
    let queryObj = { ...req.query };


    //2.replace methodunu kullanabilmek için nesneyi stringe çevir
    let queryString = JSON.stringify(queryObj)
    //3.btün opratörlerin başına $ işareti koy
    queryString = queryString.replace(/\b(gt|gte|lte|lt|ne)\b/g, (found) => `$${found}`
    )

    //4 bu mw den sonra çalışan methoda nesneyi aktar
    req.formattedQuery = JSON.parse(queryString)

    //5 mw den sonraki method çalıssın
    next()




}