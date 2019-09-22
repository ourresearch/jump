import _ from 'lodash'




const docDelCostPerUse = 25
const hardTurnawayProp = 0.1



class BaseSnap {
    constructor() {
    }

    getUses() {
        return this._addSummaryStats(
            this.getRawUses(),
            this.getCount()
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

    getCost() {
        return Object.values(this.getRawUses())
            .map(x => x.cost)
            .reduce((a, b) => a + b, 0)
    }

    getCount(){
        return Object.values(this.getRawUses())
            .map(x=>x.count)
            .reduce((a,b)=>a+b, 0)
    }

    getPaidUsesCount() {
        return Object.values(this.getRawUses())
            .filter(x => x.cost > 0)
            .map(x => x.count)
            .reduce((a, b) => a + b, 0)
    }

    getCostPerPaidUse() {
        if (!this.getPaidUsesCount()) {
            return 0
        }
        return this.getCost() / this.getPaidUsesCount()
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
            ret[k].costPerCount = ret[k].cost / ret[k].count
        })
        return ret
    }

}



function blankMod() {
    return {
        name: name,
        cost: 0,
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


const makeMods = function(journalYear, subscriptionName, subscriptionCost){
    const key = [
        journalYear.useCount,
        journalYear.oaUseCount,
        journalYear.backCatalogUseCount,
        subscriptionName,
        subscriptionCost,
        ].join()


    if (memo[key]) return memo[key]

    const resp = makeModsBase(journalYear, subscriptionName, subscriptionCost)
    memo[key] = resp
    return resp

}



function makeModsBase(journalYear, subscriptionName, subscriptionCost) {

    let freeCount = journalYear.oaUseCount + journalYear.backCatalogUseCount
    let unFreeCount = journalYear.useCount - freeCount
    let hardTurnawayCount = unFreeCount * hardTurnawayProp
    let softTurnawayCount = unFreeCount - hardTurnawayCount

    let makers = {
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
        fullSubscription: function () {
            let ret = {
                name: "fullSubscription",
                color: "#a6cee3",
                isPaid: true
            }
            if (subscriptionName === "fullSubscription") {
                ret = Object.assign({}, ret, {
                    cost: subscriptionCost,
                    count: unFreeCount,
                })
            }
            return Object.assign({}, blankMod(), ret)
        },
        docdel: function () {
            let ret = {
                name: "docdel",
                color: "#1f78b4",
                isPaid: true
            }
            if (subscriptionName === "docdel") {
                ret = Object.assign({}, ret, {
                    cost: hardTurnawayCount * docDelCostPerUse,
                    count: hardTurnawayCount,
                })
            }
            return Object.assign({}, blankMod(), ret)
        },
        backCatalog: function () {
            return Object.assign({}, blankMod(), {
                name: "backCatalog",
                count: journalYear.backCatalogUseCount,
                color: "#b2df8a",
            })
        },
        oa: function () {
            return Object.assign({}, blankMod(), {
                name: "oa",
                count: journalYear.oaUseCount,
                color: "#33a02c",
            })
        },


    };
    const ret = {}
    Object.keys(makers).forEach(usageName => (
        ret[usageName] = makers[usageName]()
    ))
    return ret

}





export {
    makeBlankMods,
    makeMods,
    BaseSnap,
    memo
}