import {makeUsageStats, usageColors} from "./UsageStat";
import {sumObjects} from "./util";

class SubrTimeline {

    constructor(apiUsage, userSettings, firstYearCost) {
        this.userSettings = userSettings
        this.firstYearCost = firstYearCost
        this.apiUsage = apiUsage
        this.name = "fullSubscription"
        this.displayName = "Subscription"
        this.yearlyCitations = {}


    }

    setUsage(apiUsage) {

    }

    setType(type) {
        this.type = type
    }


    getCost() {
        return Object.values(this.getCostByYear()).reduce((a, b) => a + b)
    }

    getCostByYear() {
        let annualCost = this.firstYearCost
        const ret = {}
        this.apiUsage.forEach(myYear => {
            ret[myYear.year] = annualCost
            annualCost = annualCost + (annualCost * this.userSettings.subrCostAnnualIncrease)
        })
        return ret
    }

    getUsageTotal() {
        return Object.values(this.getUsageCounts()).reduce((a, b) => a + b)
    }

    getNonfreeUsage() {
        const counts = this.getUsageCounts()
        return this.getUsageTotal() - (counts.oa + counts.backCatalog)
    }

    getUsageCounts() {
        return Object.values(this.getUsageByYear()).reduce(sumObjects)
    }

    getUsageStats() {
        return makeUsageStats(this.getUsageCounts())
    }

    getYears() {
        return this.apiUsage.map(x => x.year)
    }

    getUsageYear(year) {
        return this.getUsageByYear()[year]
    }

    getPercInstantAccess() {
        const usage = this.getUsageCounts()
        return 100 * (usage.fullSubscription + usage.docdel + usage.oa + usage.backCatalog) / this.getUsageTotal()
    }

    getUsageByYear() {
        const ret = {}
        this.apiUsage.forEach(apiUsageStats => {
            const total = apiUsageStats.useCount
            const free = apiUsageStats.oaUseCount + apiUsageStats.backCatalogUseCount
            const nonFree = total - free

            const usage = {
                softTurnaway: 0,
                fullSubscription: nonFree,
                docdel: 0,
                ill: 0,
                oa: apiUsageStats.oaUseCount || 0,
                backCatalog: apiUsageStats.backCatalogUseCount || 0
            }
            ret[apiUsageStats.year] = usage
        })
        return ret
    }

    getColor() {
        return usageColors[this.name]
    }
}


class IllSubrTimeline extends SubrTimeline {
    constructor(apiUsage, userSettings, firstYearCost) {
        super(apiUsage, userSettings, firstYearCost)
        this.name = "ill"
        this.displayName = "ILL"
    }

    getUsageByYear() {
        const ret = {}
        this.apiUsage.forEach(apiUsageStats => {
            const total = apiUsageStats.useCount
            const free = apiUsageStats.oaUseCount + apiUsageStats.backCatalogUseCount
            const turnaway = total - free
            const hardTurnawayCount = turnaway * this.userSettings.hardTurnawayProp

            const usage = {
                softTurnaway: Math.round(turnaway - hardTurnawayCount),
                fullSubscription: 0,
                docdel: 0,
                ill: hardTurnawayCount,
                oa: apiUsageStats.oaUseCount || 0,
                backCatalog: apiUsageStats.backCatalogUseCount || 0
            }
            ret[apiUsageStats.year] = usage
        })
        return ret
    }


    getCostByYear() {
        const ret = {}
        Object.entries(this.getUsageByYear()).forEach(([k, v]) => {
            ret[k] = v.ill * this.userSettings.illCostPerUse
        })
        return ret
    }
}

class DocdelSubrTimeline extends SubrTimeline {
    constructor(apiUsage, userSettings, firstYearCost) {
        super(apiUsage, userSettings, firstYearCost)
        this.name = "docdel"
        this.displayName = "DocDel"
    }

    getUsageByYear() {
        const ret = {}
        this.apiUsage.forEach(apiUsageStats => {
            const total = apiUsageStats.useCount
            const free = apiUsageStats.oaUseCount + apiUsageStats.backCatalogUseCount
            const turnaway = total - free
            const hardTurnawayCount = turnaway * this.userSettings.hardTurnawayProp

            const usage = {
                softTurnaway: Math.round(turnaway - hardTurnawayCount),
                fullSubscription: 0,
                docdel: hardTurnawayCount,
                ill: 0,
                oa: apiUsageStats.oaUseCount || 0,
                backCatalog: apiUsageStats.backCatalogUseCount || 0
            }
            ret[apiUsageStats.year] = usage
        })
        return ret
    }

    getCostByYear() {
        const ret = {}
        Object.entries(this.getUsageByYear()).forEach(([k, v]) => {
            ret[k] = v.docdel * this.userSettings.docDelCostPerUse
        })
        return ret
    }
}

const makeTimelines = function (apiUsage, userSettings, firstYearCost) {
    return {
        fullSubscription: new SubrTimeline(apiUsage, userSettings, firstYearCost),
        ill: new IllSubrTimeline(apiUsage, userSettings, firstYearCost),
        docdel: new DocdelSubrTimeline(apiUsage, userSettings, firstYearCost),
    }
}


export {
    makeTimelines,
    SubrTimeline,
    IllSubrTimeline,
    DocdelSubrTimeline,
}




































