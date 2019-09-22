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
const currency = function (num, roundToDollars) {
    const placesToRound = (roundToDollars) ? 0 : 2;
    return '$' + num.toFixed(placesToRound).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}


const nFormat = function (num) {

    if (!num) {
        return 0
    }

    if (num < 1) {
        return Math.round(100 * num)
    }


    // from http://stackoverflow.com/a/14994860/226013
    if (num >= 1000000) {
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
    hashCode
}
