import _ from 'lodash'




const docDelPricePerUse = 25
const hardTurnawayProp = 0.1



class BaseSnap {
    constructor() {
    }

    getUses() {
        return this._addSummaryStats(
            this.getRawUses(),
            this.getTotalCount()
        )
    }

    getRawUses() {
        throw "BaseSnap.getRawUses() must be overridden"

    }

    getFulfilledCount() {
        return Object.values(this.getRawUses())
            .filter(x => x.isFulfillment)
            .map(x => x.count)
            .reduce((a, b) => a + b, 0)
    }

    getTotalCost() {
        return Object.values(this.getRawUses())
            .map(x => x.price)
            .reduce((a, b) => a + b, 0)
    }

    getTotalCount(){
        return Object.values(this.getRawUses())
            .map(x=>x.count)
            .reduce((a,b)=>a+b, 0)
    }

    getPaidUsesCount() {
        return Object.values(this.getRawUses())
            .filter(x => x.price > 0)
            .map(x => x.count)
            .reduce((a, b) => a + b, 0)
    }

    getCostPerPaidUse() {
        if (!this.getPaidUsesCount()) {
            return 0
        }
        return this.getTotalCost() / this.getPaidUsesCount()
    }

    getEquippedUses() {
        const ret = {}
        Object.entries(this.getUses()).forEach(([k, v]) => {
            if (v.count > 0.1) ret[k] = v
        })
        return ret
    }

    getFulfillments(){
        return Object.values(this.getUses()).filter(use=>{
            return use.isFulfillment && use.count > 0.5
        })
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
        year: null
    }

    const ret = {}
    const newMods = makeMods(blankJournalYear, "free", 0)

    Object.entries(newMods).forEach(([k,v])=>{
        ret[k] = {...v}
    })

    return ret
}




const memo = {}


const makeMods = function(journalYear, subscriptionName, subscriptionPrice){
    const key = [
        journalYear.useCount,
        journalYear.oaUseCount,
        journalYear.backCatalogUseCount,
        subscriptionName,
        subscriptionPrice,
        ].join()


    if (memo[key]) return memo[key]

    const resp = makeModsBase(journalYear, subscriptionName, subscriptionPrice)
    memo[key] = resp
    return resp

}


// const makeMods = _.memoize(
//     makeModsBase,
//     function(journalYear, subscriptionName, subscriptionPrice){
//         let key = [
//             journalYear.useCount,
//             journalYear.oaUseCount,
//             journalYear.backCatalogUseCount,
//             journalYear.year,
//             subscriptionName,
//             subscriptionPrice,
//             ].join()
//         return key
//
//     })

function makeModsBase(journalYear, subscriptionName, subscriptionPrice) {
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


export {
    makeBlankMods,
    makeMods,
    BaseSnap,
    memo
}