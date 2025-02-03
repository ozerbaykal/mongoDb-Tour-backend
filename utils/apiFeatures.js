//sıralama filtreleme  alan limitleme sayfalama gibi özellikleri projde birden fazla noktada kullanmak isteyebiliriz bu durumda kod tekrarına düşmemek için bütün  bu methodları bir class içerisinde tanımlayalım

class APIFeatures {
    constructor(query, params, formattedParams) {
        this.query = query,// veritabanı sorgusu
            this.params = params,//api den gel saf parametreler
            this.formattedParams = formattedParams //mw den gelen formatlanmı parametreler
    }

    filter() {
        return this;

    }

    sort() {
        return this
    }

    limit() {
        return this
    }

    pagination() {
        return this
    }
}