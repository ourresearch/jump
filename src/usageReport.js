const docDelPricePerUse = 25
const hardTurnawayProp = 0.1

export default class UsageReport {
    constructor() {
        this.years = {}
        this.name = "usage report!"
    }

    setFromApi(usageByTypeByYear) {
        this.usageSnapsByYear = usageByTypeByYear.map(usageYear => {

        })
    }

    setYearSnapFromApiData(year, apiData, subscriptionName) {
        console.log("i am setting the yearsnap", subscriptionName)

        this.years[year] = new UsageSnap(apiData, subscriptionName)
    }

    subscribe(name, price) {

    }


    getOverallSnap() {
        const ret = new UsageSnap()
        Object.entries(this.years).forEach(([year, mySnap]) => {
            ret.addSnap(mySnap)
        })
        return ret
    }

    getYears() {
        return this.years
    }

}


class AggregateSnap {
    constructor(subscriptionSnaps) {

    }

    addSubscriptionSnap(snap) {

    }
}


class BaseSnap {

}

class SubscriptionSnap {
    constructor(apiData, subscriptionName, fullSubscriptionPrice) {
        this.apiData = apiData
        this.subscriptionName = subscriptionName
        this.subscriptionPrice = fullSubscriptionPrice
    }

    getUses() {
        const ret = makeMods(this.apiData, this.subscriptionName, this.subscriptionPrice)
        return this._addSummaryStats(ret)
    }

    subscribe(name, price) {
        this.subscriptionName = name
        this.subscriptionPrice = price || 0
    }


    _addSummaryStats(modsDict, totalCount) {
        const ret = {...modsDict}
        Object.keys(ret).forEach(k => {
            ret[k].prop = ret[k].count / totalCount
            ret[k].pricePerCount = ret[k].price / ret[k].count
        })
        return ret
    }
}


class UsageSnap {
    constructor(apiData) {
        this.apiData = apiData
        this.subscriptionName = "free"
        this.subscriptionPrice = 0
    }

    getTotalUseCount() {
        return Object.values(this.uses)
            .map(x => x.count)
            .reduce((a, b) => a + b)
    }

    subscribe(name, price) {
        this.subscriptionName = name
        this.subscriptionPrice = price || 0
    }

    getUses() {
        let ret
        if (this.apiData) {
            ret = makeMods(this.apiData, this.subscriptionName, this.subscriptionPrice)
        } else {
            ret = makeBlankMods()
        }
        const totalCount = this.getTotalUseCount()
        Object.keys(ret).forEach(k => {
            ret[k].prop = ret[k].count / totalCount
            ret[k].pricePerCount = ret[k].price / ret[k].count
        })

        return ret
    }

    getFulfilledCount() {
        return Object.values(this.uses)
            .filter(x => x.isFulfillment)
            .map(x => x.count)
            .reduce((a, b) => a + b)
    }

    getTotalCost() {
        return Object.values(this.uses)
            .map(x => x.count)
            .reduce((a, b) => a + b)
    }

    getPaidUsesCount() {
        return Object.values(this.uses)
            .filter(x => x.price > 0)
            .map(x => x.count)
            .reduce((a, b) => a + b, 0)
    }

    getCostPerPaidUse() {
        if (!this.getPaidUsesCount()) {
            return 0
        }
        return this.getFulfilledCount() / this.getPaidUsesCount()
    }

    getEquippedUses() {
        const ret = {}
        Object.entries(this.getUses()).forEach(([k, v]) => {
            if (v.count > 0.1) ret[k] = v
        })
        return ret
    }

    getUse(useType) {
        const ret = {...this.uses[useType]}
        ret.prop = ret.count / this.getTotalUseCount()
        ret.pricePerCount = ret.price / ret.count
        return ret
    }


    addSnap(newSnap) {
        Object.entries(newSnap.uses).forEach(([k, v]) => {
            this.uses[k].count += v.count
            this.uses[k].price += v.price
        })
    }

}


function blankMod() {
    return {
        name: name,
        price: 0,
        count: 0,
        color: "#000",
        isFulfillment: true,
        isPaid: false
    }
}

function makeBlankMods() {
    const blankJournalYear = {
        oaUseCount: 0,
        backCatalogUseCount: 0,
        useCount: 0,
    }
    return makeMods(blankJournalYear, "free", 0)
}


function makeMods(journalYear, subscriptionName, subscriptionPrice) {
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
                color: "#43a047",
            })
        },
        backCatalog: function () {
            return Object.assign({}, base, {
                name: "backCatalog",
                count: journalYear.backCatalogUseCount,
                color: "#c0ca33",
            })
        },
        fullSubscription: function () {
            let ret = {
                name: "fullSubscription",
                color: "#ef5350",
                isPaid: true
            }
            if (subscriptionName === "fullSubscription") {
                ret = Object.assign({}, ret, {
                    price: subscriptionPrice,
                    count: unFreeCount,
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
            if (subscriptionName === "docdel") {
                ret = Object.assign({}, ret, {
                    price: hardTurnawayCount * docDelPricePerUse,
                    count: hardTurnawayCount,
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
            if (subscriptionName === "free") {
                ret = Object.assign({}, ret, {
                    count: hardTurnawayCount,
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
                })
            }
            return Object.assign({}, blankMod(), ret)
        },
    };
    const ret = {}
    Object.keys(makers).forEach(usageName => (
        ret[usageName] = makers[usageName]()
    ))
    return ret

}
