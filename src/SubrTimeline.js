import {sumObjects} from "./util";

class SubrTimeline {

    constructor(apiUsage, citations, userSettings, firstYearCost) {
        this.userSettings = userSettings
        this.firstYearCost = firstYearCost
        this.apiUsage = apiUsage
        this.name = "fullSubscription"
        this.displayName = "Subscription"
        this.citations = citations

        this.cache = {}


    }

    setUsage(apiUsage) {

    }

    setType(type) {
        this.type = type
    }


    getCostTotal() {
        return Object.values(this.getCostByTypeByYear()).reduce((a, b) => a + b)
    }
    getCostPerNegotiableUse(){
        return this.getCostTotal() / this.getNegotiableUsage()
    }

    getCostByTypeByYear() {
        if (this.cache.getCostByTypeByYear) {
            return this.cache.getCostByTypeByYear
        }
        let annualCost = this.firstYearCost
        const ret = {}
        this.apiUsage.forEach(myYear => {
            ret[myYear.year] = annualCost
            annualCost = annualCost + (annualCost * this.userSettings.subrCostAnnualIncrease)
        })
        this.cache.getCostByTypeByYear = ret
        return ret
    }

    getUsageTotal() {
        return Object.values(this.getUsageCounts()).reduce((a, b) => a + b)
    }

    getFreeUsage() {
        const counts = this.getUsageCounts()
        return counts.oa + counts.backCatalog + counts.rg
    }

    getNegotiableUsage() {
        return this.getUsageTotal() - this.getFreeUsage()
    }

    getUsageCounts() {
        return Object.values(this.getUsageByTypeByYear()).reduce(sumObjects)
    }


    getYears() {
        return this.apiUsage.map(x => x.year)
    }

    getUsageYear(year) {
        return this.getUsageByTypeByYear()[year]
    }

    getPercInstantAccess() {
        const usage = this.getUsageCounts()
        return 100 * (usage.fullSubscription + usage.docdel + usage.oa + usage.backCatalog + usage.rg) / this.getUsageTotal()
    }

    getUsageByTypeByYear() {
        if (this.cache.getUsageByTypeByYear) {
            return this.cache.getUsageByTypeByYear
        }
        const ret = {}
        this.apiUsage.forEach(apiUsageStats => {
            ret[apiUsageStats.year] = this._makeUsageDictFromYearStats(apiUsageStats)
        })

        this.cache.getUsageByTypeByYear = ret
        return ret
    }

    _weightApiUsageStats(apiUsageStats){
        const citationWeight = this.userSettings.downloadsPerCitation / apiUsageStats.useCount
        const authorshipWeight = this.userSettings.downloadsPerAuthorship / apiUsageStats.useCount
        const ret = {}
        Object.entries(apiUsageStats).forEach(([k,v])=>{
            const citationDownloads = v * citationWeight
            const authorshipDownloads = v * authorshipWeight
            ret[k] = v + citationDownloads + authorshipDownloads
        })
        return ret
    }


    _makeUsageDictFromYearStats(apiUsageStats) {
        const weightedStats = this._weightApiUsageStats(apiUsageStats)
        const total = weightedStats.useCount
        let free = weightedStats.oaUseCount + weightedStats.backCatalogUseCount + weightedStats.rgUseCount
        if (free > total) free = total

        const nonFree = total - free
        return {
            // these get changed in subclasses
            softTurnaway: 0,
            fullSubscription: nonFree,
            docdel: 0,
            ill: 0,

            // these don't
            oa: weightedStats.oaUseCount || 0,
            backCatalog: weightedStats.backCatalogUseCount || 0,
            rg: weightedStats.rgUseCount || 0,
        }
    }


}


class IllSubrTimeline extends SubrTimeline {
    constructor(apiUsage, userSettings, firstYearCost) {
        super(apiUsage, userSettings, firstYearCost)
        this.name = "ill"
        this.displayName = "ILL"
    }


    _makeUsageDictFromYearStats(apiUsageStats){
        const usage = super._makeUsageDictFromYearStats(apiUsageStats)
        usage.ill = usage.fullSubscription * this.userSettings.hardTurnawayProp
        usage.turnaway = usage.fullSubscription - usage.ill
        usage.fullSubscription = 0
        return usage
    }

    getCostByTypeByYear() {
        const ret = {}
        Object.entries(this.getUsageByTypeByYear()).forEach(([k, v]) => {
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

    _makeUsageDictFromYearStats(apiUsageStats){
        const usage = super._makeUsageDictFromYearStats(apiUsageStats)
        usage.docdel = usage.fullSubscription * this.userSettings.hardTurnawayProp
        usage.turnaway = usage.fullSubscription - usage.docdel
        usage.fullSubscription = 0
        return usage
    }

    getCostByTypeByYear() {
        const ret = {}
        Object.entries(this.getUsageByTypeByYear()).forEach(([k, v]) => {
            ret[k] = v.docdel * this.userSettings.docDelCostPerUse
        })
        return ret
    }
}

const makeTimelines = function (apiUsage, citations, userSettings, firstYearCost) {
    return {
        fullSubscription: new SubrTimeline(apiUsage, citations, userSettings, firstYearCost),
        ill: new IllSubrTimeline(apiUsage, citations, userSettings, firstYearCost),
        docdel: new DocdelSubrTimeline(apiUsage, citations, userSettings, firstYearCost),
    }
}


export {
    makeTimelines,
    SubrTimeline,
    IllSubrTimeline,
    DocdelSubrTimeline,
}




































