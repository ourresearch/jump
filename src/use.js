const docDelPricePerUse = 25
const hardTurnawayProp = 0.1


const sumObjects = function (a, b) {
    let ret = {}
    Object.keys(a).forEach(k => {
        ret[k] = a[k] + b[k]
    })
    return ret
}


function makePotentialUses(stat, subscriptionName) {
    return ["fullSubscription", "docdel"]
        .filter(x => x !== subscriptionName)
        .map(potentialSubscriptionName => {
            // make full of this type
            return makeMods(stat, potentialSubscriptionName)
                .find(mod => {
                    // only return the subscription use, not all of them.
                    return mod.name === potentialSubscriptionName
                })
        })
}


function blankMod() {
    return {
        name: name,
        price: 0,
        count: 0,
        prop: 0,
        pricePerCount: 0,
        color: "#000",
        isFulfillment: true,
        isEquipped: false,
        isPaid: false
    }
}


function getTurnaways(fulfilledUseCount, totalUseCount, subscriptionName) {

    const turnawayCount = totalUseCount - fulfilledUseCount
    const hardTurnawayCount = turnawayCount * hardTurnawayProp
    const softTurnawayCount = turnawayCount - hardTurnawayCount

    const defs = {
        hardTurnaway: function () {
            let ret = {
                name: "hardTurnaway",
                color: "#555",
                isFulfillment: false
            }

            // docdel wipes out all hard turnaways
            // fullsubscription does too
            if (subscriptionName === "free") {
                ret = Object.assign({}, ret, {
                    count: hardTurnawayCount,
                    prop: hardTurnawayCount / totalUseCount,
                })
            }
            return Object.assign({}, blankMod(), ret)
        },
        softTurnaway: function () {
            let ret = {
                name: "softTurnaway",
                color: "#999",
                isFulfillment: false
            }

            // full subscription wipes out all soft turnaways
            if (subscriptionName !== "fullSubscription") {
                ret = Object.assign({}, ret, {
                    count: softTurnawayCount,
                    prop: softTurnawayCount / totalUseCount
                })
            }
            return Object.assign({}, blankMod(), ret)
        },
    }

    return [
        defs.hardTurnaway(), defs.softTurnaway()
    ]
}

function makeFreeFulfillmentMods(stat) {
    const makers = [
        function () {
            return Object.assign(blankMod(), {
                name: "oa",
                count: stat.oaUseCount,
                prop: stat.oaUseCount / stat.useCount,
                color: "#43a047",
                isEquipped: true
            })
        },
        function () {
            return Object.assign(blankMod(), {
                name: "backCatalog",
                count: stat.backCatalogUseCount,
                prop: stat.backCatalogUseCount / stat.useCount,
                color: "#c0ca33",
                isEquipped: true
            })
        },
    ]
    return makers.map(x => x())
}


// @todo work here
function makePaidMods(stat, subscriptionName) {
    const turnawayCount = stat.useCount - (stat.oaUseCount + stat.backCatalogUseCount)
    const hardTurnawayCount = turnawayCount * hardTurnawayProp
    // const softTurnawayCount = turnawayCount - hardTurnawayCount

    const makers = [
        function () {
            let ret = {
                name: "fullSubscription",
                color: "#ef5350",
                isPaid: true
            }
            if (subscriptionName === "fullSubscription") {
                ret = Object.assign({}, ret, {
                    price: stat.subscriptionPrice,
                    count: turnawayCount,
                    prop: turnawayCount / stat.useCount,
                    pricePerCount: stat.subscriptionPrice / turnawayCount,
                    isEquipped: true
                })
            }
            return Object.assign({}, base, ret)
        },
        function () {
            let ret = {
                name: "docdel",
                color: "#ff7043",
                isPaid: true
            }
            if (subscriptionName === "docdel") {
                ret = Object.assign({}, ret, {
                    price: hardTurnawayCount * docDelPricePerUse,
                    count: hardTurnawayCount,
                    prop: hardTurnawayCount / stat.useCount,
                    pricePerCount: docDelPricePerUse,
                    isEquipped: true
                })
            }
            return Object.assign({}, base, ret)
        }
    ]
}


function makeMods(stat, subscription) {
    let base = blankMod()

    let freeCount = stat.oaUseCount + stat.backCatalogUseCount
    let unFreeCount = stat.useCount - freeCount
    let hardTurnawayCount = unFreeCount * hardTurnawayProp

    let makers = {
        oa: function () {
            return Object.assign({}, base, {
                name: "oa",
                count: stat.oaUseCount,
                prop: stat.oaUseCount / stat.useCount,
                color: "#43a047",
                isEquipped: true
            })
        },
        backCatalog: function () {
            return Object.assign({}, base, {
                name: "backCatalog",
                count: stat.backCatalogUseCount,
                prop: stat.backCatalogUseCount / stat.useCount,
                color: "#c0ca33",
                isEquipped: true
            })
        },
        fullSubscription: function () {
            let ret = {
                name: "fullSubscription",
                color: "#ef5350",
                isPaid: true
            }
            if (subscription === "fullSubscription") {
                ret = Object.assign({}, ret, {
                    price: stat.subscriptionPrice,
                    count: unFreeCount,
                    prop: unFreeCount / stat.useCount,
                    pricePerCount: stat.subscriptionPrice / unFreeCount,
                    isEquipped: true
                })
            }
            return Object.assign({}, base, ret)
        },
        docdel: function () {
            let ret = {
                name: "docdel",
                color: "#ff7043",
                isPaid: true
            }
            if (subscription === "docdel") {
                ret = Object.assign({}, ret, {
                    price: hardTurnawayCount * docDelPricePerUse,
                    count: hardTurnawayCount,
                    prop: hardTurnawayCount / stat.useCount,
                    pricePerCount: docDelPricePerUse,
                    isEquipped: true
                })
            }
            return Object.assign({}, base, ret)
        },
    };

    const fulfilledUses = Object.values(makers).map(x => x())
    const fulfilledUseCount = fulfilledUses
        .map(x => x.count)
        .reduce((a, b) => a + b, 0)
    const turnawayUses = getTurnaways(fulfilledUseCount, stat.useCount, subscription)
    return [].concat(fulfilledUses, turnawayUses)

}







const subscriptionUseReport = function (statsByYear, subscriptionName) {

    const overallUses = makeMods(
        statsByYear.reduce(sumObjects),
        subscriptionName
    )
    const yearlyUses = statsByYear.map(year => {
        return {
            year: year.year,
            uses: makeMods(year, subscriptionName)
        }
    })
    const fulfilledCost = overallUses
        .filter(x => x.isFulfillment)
        .map(x => x.price)
        .reduce((a, b) => a + b)

    const paidUsesCount = overallUses
        .filter(x => x.price > 0)
        .map(x => x.count)
        .reduce((a, b) => a + b, 0)

    return {
            uses: overallUses,
            yearlyUses: yearlyUses,
            potentialUses: makePotentialUses(
                statsByYear.reduce(sumObjects),
                subscriptionName
            ),
            fulfilledCount: overallUses
                .filter(x => x.isFulfillment)
                .map(x => x.count)
                .reduce((a, b) => a + b),
            fulfilledCost: fulfilledCost,
            pricePerPaidUse: fulfilledCost / paidUsesCount,
            getUse: name => {
                return overallUses.find(x => x.name === name)
            }

    }
}



export {subscriptionUseReport}