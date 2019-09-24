import _ from "lodash";


import {sumObjects} from "./util";

const docDelCostPerUse = 25
const hardTurnawayProp = 0.1


const makeJournal = function (apiData, selectedSubscriptionName) {

    const selectSubscription = function (subscriptionsList) {
        return subscriptionsList.find(mySub => {
            return mySub.name === selectedSubscriptionName
        })
    }

    const selectedSubscriptionByYear = apiData.subscriptionsByYear.map(myYear => {
        return {
            year: myYear.year,
            subscriptions: selectSubscription(myYear.subscriptions)
        }
    })
    const mySelectedSubscription = selectSubscription(apiData.subscriptions)
    const bestCostPerPaidUse = Math.min(...apiData.subscriptions.map(sub=>{
        return sub.costPerPaidUse()
    }))

    return {
        meta: apiData.meta,
        subscriptions: {
            selected: {
                name: selectedSubscriptionName,
                overall: mySelectedSubscription,
                byYear: selectedSubscriptionByYear
            },
            possible: {
                overall: apiData.subscriptions,
                overallUsageStats: apiData.subscriptions.map(sub => {
                    return sub.selfStat()
                })

                // we never need all possible subscriptions by year
                // byYear: apiData.subscriptionsByYear
            }
        },
        sortKeys: {
            hardTurnawayCount: mySelectedSubscription.usage.hardTurnaway,
            bestCostPerPaidUse: bestCostPerPaidUse
        }


        //
        // subscriptionName: subscriptionName,
        //
        // usageYears: usageYears,  // array of usageStat dicts
        // usageSums: Object.values(usageYears).reduce(sumObjects), // dict like {oa: 22, docdel: 0, ...}
        // usageStats: usageStats,
        //
        // fullSubscriptionCost: fullSubscriptionCost,
        // docdelCost: docdelCost,
        // myCost: myCost,
        // costPerPaidUse: myCost / usageStats.paidUseCount
    }
}


class BaseSubscription {
    constructor() {
        this.usage = {
            softTurnaway: 0,
            hardTurnaway: 0,
            fullSubscription: 0,
            docdel: 0,
            backCatalog: 0,
            oa: 0
        }
        this.cost = 0
        this.name = null
        this.year = null
    }

    costPerPaidUse() {
        return this.cost / this.paidUseCount()
    }

    paidUseCount() {
        return this.usage.fullSubscription + this.usage.docdel
    }
    freeUseCount(){
        return this.usage.oa + this.usage.backCatalog
    }

    useCount() {
        return _.sum(Object.values(this.usage))
    }

    usageStats() {
        const useCount = this.useCount()
        return Object.entries(this.usage).map(([k, v]) => {
            const costForThisUseType = (this.name === k) ? this.cost : 0
            return {
                name: k,
                count: v,
                percentage: 100 * v / useCount,
                cost: costForThisUseType,
                costPerCount: costForThisUseType / v
            }
        })
    }

    selfStat() {
        throw "paidUsageStat() needs to be overridden"
    }
}

class FullSubscription extends BaseSubscription {
    constructor(apiUsageStats, cost) {
        super()
        const total = apiUsageStats.useCount
        const free = apiUsageStats.oaUseCount + apiUsageStats.backCatalogUseCount
        const nonFree = total - free

        this.usage = {
            softTurnaway: 0,
            hardTurnaway: 0,
            fullSubscription: nonFree,
            docdel: 0,
            oa: apiUsageStats.oaUseCount,
            backCatalog: apiUsageStats.backCatalogUseCount
        }

        this.cost = cost
        this.name = "fullSubscription"
    }

    selfStat() {
        const usageStats = this.usageStats()
        return usageStats.find(x => x.name === this.name)
    }
}

class DocdelSubscription extends BaseSubscription {
    constructor(myFullSubscription) {
        super()
        const turnaway = myFullSubscription.usage.fullSubscription
        const hardTurnawayCount = turnaway * hardTurnawayProp
        this.usage = {
            softTurnaway: Math.round(turnaway - hardTurnawayCount),
            hardTurnaway: 0,
            fullSubscription: 0,
            docdel: turnaway * hardTurnawayProp,
            backCatalog: myFullSubscription.backCatalog,
            oa: myFullSubscription.oaUseCount
        }
        this.name = "docdel"
        this.cost = docDelCostPerUse * hardTurnawayCount
        this.year = myFullSubscription.year
    }

    selfStat() {
        const usageStats = this.usageStats()
        return usageStats.find(x => x.name === this.name)
    }
}

class FreeSubscription extends BaseSubscription {
    constructor(myFullSubscription) {
        super()
        const turnaway = myFullSubscription.usage.fullSubscription
        let hardTurnawayCount = turnaway * hardTurnawayProp

        this.usage = {
            softTurnaway: turnaway - hardTurnawayCount,
            hardTurnaway: hardTurnawayCount,
            fullSubscription: 0,
            docdel: 0,
            backCatalog: myFullSubscription.usage.backCatalog,
            oa: myFullSubscription.usage.oaUseCount
        }
        this.name = "free"
        this.cost = docDelCostPerUse * hardTurnawayCount
        this.year = myFullSubscription.year
    }

    selfStat() {
        return {
            name: "free",
            count: this.freeUseCount(),
            percentage: 100 * this.freeUseCount() / this.useCount(),
            cost: 0,
            costPerCount: 0
        }
    }
}


const makeSubscriptions = function (apiUsageStats, cost, year) {
    const full = new FullSubscription(apiUsageStats, cost)
    full.year = year
    return [
        full,
        new DocdelSubscription(full),
        new FreeSubscription(full)
    ]
}


const idea = "usage comes from a subscription. so by applying this subscription, you are getting this usage," +
    "including the usage by year, and including the usage details report stuff (which can be reused by the " +
    "sumup on hte top of page" +

    "also: there is an order to how things need to change:" +
    "1: get a ChangeSubscription event with an issnl and a name" +
    "2: changeSubscription(issnl, name)" +
    "3: this.journalsDict[issnl] = makeJournal(apiData[issnl], newSubscriptionName)" +
    "4: this.journalsToPrint = Object.values(this.journalsDict).sort(sortFn).slice(startIndex, endIndex) "


export {
    makeSubscriptions,
    makeJournal
}














