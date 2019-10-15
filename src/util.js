

const sumObjects = function(a,b) {
    const ret = {}
    const allKeys = [...new Set([]
        .concat( Object.keys(a))
        .concat(Object.keys(b)))]

    allKeys.forEach(k=>{
        ret[k] = 0
        if (a[k]) ret[k] += a[k]
        if (b[k]) ret[k] += b[k]
    })

    return ret
}


// from https://stackoverflow.com/a/7616484/226013
const hashCode = function (str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};


// https://blog.abelotech.com/posts/number-currency-formatting-javascript/
const currency = function (num, roundToDollars, asDiff) {
    let placesToRound = 2
    if (roundToDollars===true){
        placesToRound = 0
    }
    else if (roundToDollars > 2){
        placesToRound = roundToDollars // hack
    }

    // const placesToRound = (roundToDollars) ? 0 : 2;
    const str = num.toFixed(placesToRound).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

    if (asDiff && num < 0) {
        return str.replace("-", "-$")
    }
    if (num < 0){
        return "-$" + str.slice(1, str.length)
    }
    else {
        return "$" + str
    }

}


const nFormat = function (num, printReallyLongNumbers) {

    printReallyLongNumbers = true

    if (!num) {
        return 0
    }

    if (num < 1) {
        return Math.round(100 * num) / 100
    }


    // from http://stackoverflow.com/a/14994860/226013
    if (num >= 1000000 && !printReallyLongNumbers) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else {
        return num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    // if (num >= 1000) {
    //     return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    // }
    return num;
}


export {
    nFormat,
    currency,
    hashCode,
    sumObjects
}
