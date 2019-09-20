const docDelPricePerUse = 25
const hardTurnawayProp = 0.1


const sumObjects = function (a, b) {
    let ret = {}
    Object.keys(a).forEach(k => {

        ret[k] = a[k] + b[k]
    })
    return ret
}

const sumJournalYears = function(a,b){
    let ret = {}
    ret.useCount = a.useCount + b.useCount
    ret.oaUseCount = a.oaUseCount + b.oaUseCount
    ret.backCatalogUseCount = a.backCatalogUseCount + b.backCatalogUseCount
    ret.subscriptionPrice = a.subscriptionPrice + b.subscriptionPrice

    ret.year = a.year
    ret.issnl = a.issnl
    ret.subscribedTo = a.subscribedTo

    return ret
}



const journalYear = function(){
    return {
        useCount: 0,
        oaUseCount: 0,
        backCatalogUseCount: 0,
        subscriptionPrice: 0,
        year: null,
        issnl: null,
        subscribedTo: null
    }
}



function makePotentialUses(journalYears) {
    const journalYearsSum = journalYears.reduce(sumJournalYears)

    return ["fullSubscription", "docdel"]
        .filter(x => x !== journalYearsSum.subscribedTo)
        .map(potentialSubscriptionName => {
            // make full of this type
            const newJournalYear = {...journalYearsSum}
            newJournalYear.subscribedTo = potentialSubscriptionName
            return makeMods(newJournalYear)
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

const sumModLists = function(a,b){
    const totalUsesCount = a.map(x=>x.count).reduce((a,b) => a+b) +
        b.map(x=>x.count).reduce((a,b) => a+b)

    return a.map(aMod => {
        const bMod = b.find(x=>x.name === aMod.name)
        const mySumCount = aMod.count + bMod.count
        const mySumPrice = aMod.price + bMod.price
        return Object.assign({}, aMod, {
            count: mySumCount,
            price: mySumPrice,
            prop: mySumCount / totalUsesCount,
            pricePerCount: mySumPrice / mySumCount
        })
    })


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




function makeFulfillmentMods(stat) {
    let base = blankMod()

    let freeCount = stat.oaUseCount + stat.backCatalogUseCount
    let unFreeCount = stat.useCount - freeCount
    let hardTurnawayCount = unFreeCount * hardTurnawayProp
    let softTurnawayCount = unFreeCount - hardTurnawayCount

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
            if (stat.subscribedTo === "fullSubscription") {
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
            if (stat.subscribedTo === "docdel") {
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
        hardTurnaway: function () {
            let ret = {
                name: "hardTurnaway",
                color: "#555",
                isFulfillment: false
            }

            // docdel wipes out all hard turnaways
            // fullsubscription does too
            if (stat.subscribedTo === "free") {
                ret = Object.assign({}, ret, {
                    count: hardTurnawayCount,
                    prop: hardTurnawayCount / stat.useCount,
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
            if (stat.subscribedTo !== "fullSubscription") {
                ret = Object.assign({}, ret, {
                    count: softTurnawayCount,
                    prop: softTurnawayCount / stat.useCount
                })
            }
            return Object.assign({}, blankMod(), ret)
        },
    };

    return Object.values(makers).map(x => x())

}


function makeMods(stat) {
    const fulfillmentMods = makeFulfillmentMods(stat)
    const fulfilledUseCount = fulfillmentMods
        .map(x => x.count)
        .reduce((a, b) => a + b, 0)


    return fulfillmentMods

    return [].concat(
        fulfillmentMods,
        getTurnaways(fulfilledUseCount, stat.useCount, stat.subscribedTo)
    )
}


const useReport = function(yearlyUses, overallUses){
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

const overallUseReport = function(subscriptionUseReports){
    const years = {}
    const overall = []

    subscriptionUseReports.forEach(useList=>{
        useList.yearlyUses.forEach(yearObj=>{
            if (years[yearObj.year]) {
                years[yearObj.year].push(yearObj.uses)
            }
            else {
                years[yearObj.year] = []
            }
        })
        overall.push(useList.uses)

    })
    const yearlyUses = Object.entries(years).map(entry=>{
        return {
            year: entry[0],
            uses: entry[1].reduce(sumModLists)
        }
    })
    const overallUses = overall.reduce(sumModLists)

    const ret = useReport(yearlyUses, overallUses)

    console.log("overall use report", ret)
    return ret
}


const yearlyUses = function(journalYears){
    return journalYears.map(myJournalYear => {
        return {
            year: myJournalYear.year,
            uses: makeMods(myJournalYear)
        }
    })
}

const overallUses = function(journalYears){
    return makeMods(journalYears.reduce(sumJournalYears))
}






const subscriptionUseReport = function (journalYears) {
    const yearlyUses = journalYears.map(year => {
        return {
            year: year.year,
            uses: makeMods(year)
        }
    })
    const overallUses = makeMods(
        journalYears.reduce(sumJournalYears)
    )
    return Object.assign(
        {},
        useReport(yearlyUses, overallUses),
        {
            potentialUses: makePotentialUses(journalYears)
        }
    )

}






export {
    subscriptionUseReport,
    overallUseReport,
    journalYear,
    yearlyUses,
    overallUses,
    makePotentialUses
}