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
    let ret = journalYear()
    ret.useCount = a.useCount + b.useCount
    ret.oaUseCount = a.oaUseCount + b.oaUseCount
    ret.backCatalogUseCount = a.backCatalogUseCount + b.backCatalogUseCount


    if (a.subscriptionPrice) {
        ret.subscriptionPrice += a.subscriptionPrice
    }
    if (b.subscriptionPrice) {
        ret.subscriptionPrice += b.subscriptionPrice
    }

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

// function sumMods(a, b){
//     if (a.name !== b.name){
//         throw(["can't sum two mods of different type!", a, b])
//     }
//     const ret = blankMod()
//
//     ret.price = a.price + b.price
//     ret.count = a.count + b.count
//     ret.pricePerCount = ret.price / ret.count


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





function makeMods(journalYear) {
    let base = blankMod()

    let freeCount = journalYear.oaUseCount + journalYear.backCatalogUseCount
    let unFreeCount = journalYear.useCount - freeCount
    let hardTurnawayCount = unFreeCount * hardTurnawayProp
    let softTurnawayCount = unFreeCount - hardTurnawayCount

    let makers = {
        oa: function () {
            return Object.assign({}, base, {
                name: "oa",
                count: journalYear.oaUseCount,
                prop: journalYear.oaUseCount / journalYear.useCount,
                color: "#43a047",
                isEquipped: true
            })
        },
        backCatalog: function () {
            return Object.assign({}, base, {
                name: "backCatalog",
                count: journalYear.backCatalogUseCount,
                prop: journalYear.backCatalogUseCount / journalYear.useCount,
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
            if (journalYear.subscribedTo === "fullSubscription") {
                ret = Object.assign({}, ret, {
                    price: journalYear.subscriptionPrice,
                    count: unFreeCount,
                    prop: unFreeCount / journalYear.useCount,
                    pricePerCount: journalYear.subscriptionPrice / unFreeCount,
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
            if (journalYear.subscribedTo === "docdel") {
                ret = Object.assign({}, ret, {
                    price: hardTurnawayCount * docDelPricePerUse,
                    count: hardTurnawayCount,
                    prop: hardTurnawayCount / journalYear.useCount,
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
            if (journalYear.subscribedTo === "free") {
                ret = Object.assign({}, ret, {
                    count: hardTurnawayCount,
                    prop: hardTurnawayCount / journalYear.useCount,
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
            if (journalYear.subscribedTo !== "fullSubscription") {
                ret = Object.assign({}, ret, {
                    count: softTurnawayCount,
                    prop: softTurnawayCount / journalYear.useCount
                })
            }
            return Object.assign({}, blankMod(), ret)
        },
    };

    return Object.values(makers).map(x => x())

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
    console.log("overallUses", journalYears.length)
    console.log("all years with not free", journalYears.filter(x=>x.subscribedTo !== "free"))
    console.log("journal years reduced", journalYears.reduce(sumJournalYears))

    const ret = makeMods(journalYears.reduce(sumJournalYears))
    console.log("returning le mods", ret)
    return ret
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