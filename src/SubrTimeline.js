import {sumObjects} from "./util";

class SubrTimeline {

    constructor(apiData, userSettings) {
        this.userSettings = userSettings
        this.issnl = apiData.meta.issnl

        this.firstYearCost = apiData.fullSubrCost2018
        this.apiUsage = apiData.yearlyDownloads
        this.citations = apiData.citations
        this.authorships = apiData.authorships

        this.name = "fullSubscription"
        this.displayName = "Subscription"

    }


    _getCache(name){
        return this.userSettings.getCache(this.issnl, this.name, name)
    }
    _setCache(name, value){
        return this.userSettings.setCache(this.issnl, this.name, name, value)
    }

    getCostTotal() {
        if (this._getCache("getCostTotal")){
            return this._getCache("getCostTotal")
        }

        const ret = Object.values(this.getCostByTypeByYear()).reduce((a, b) => a + b) / 5 || 0
        this._setCache("getCostTotal", ret)
        return ret


    }
    getCostPerNegotiableUse(){
        return (this.getCostTotal() / this.getNegotiableUsage()) || 0
    }

    getCostByTypeByYear() {
        if (this._getCache("getCostByTypeByYear")) {
            return this._getCache("getCostByTypeByYear")
        }

        let annualCost = this.firstYearCost
        const ret = {}
        this.apiUsage.forEach(myYear => {
            ret[myYear.year] = annualCost
            annualCost = annualCost + (annualCost * this.userSettings.subrCostAnnualIncrease)
        })
        this._setCache("getCostByTypeByYear", ret)
        return ret
    }

    getAnnualUsageTotal() {
        return Object.values(this.getAnnualUsageByType()).reduce((a, b) => a + b)
    }

    getFreeUsage() {
        const counts = this.getAnnualUsageByType()
        return (counts.oa + counts.backCatalog + counts.rg)
    }

    getNegotiableUsage() {
        return (this.getAnnualUsageTotal() - this.getFreeUsage())
    }

    getAnnualUsageByType() {
        const totals = Object.values(this.getUsageByTypeByYear()).reduce(sumObjects)
        return _.mapValues(totals, x => x / 5)
    }


    getYears() {
        return this.apiUsage.map(x => x.year)
    }

    getUsageYear(year) {
        return this.getUsageByTypeByYear()[year]
    }

    getPercInstantAccess() {
        const usage = this.getAnnualUsageByType()
        return 100 * (usage.fullSubscription + usage.docdel + usage.oa + usage.backCatalog + usage.rg) / (this.getAnnualUsageTotal() * 5)
    }

    getUsageByTypeByYear() {
        if (this._getCache("getUsageByTypeByYear")){
            return this._getCache("getUsageByTypeByYear")
        }
        const ret = {}
        this.apiUsage.forEach(apiUsageStats => {
            ret[apiUsageStats.year] = this._makeUsageDictFromYearStats(apiUsageStats)
        })

        this._setCache("getUsageByTypeByYear", ret)
        return ret
    }

    _weightApiUsageStats(apiUsageStats){
        const downloadsFromCitations = this.userSettings.downloadsPerCitation * this.citations
        const downloadsFromAuthorships = this.userSettings.downloadsPerAuthorship * this.authorships



        const citationWeight = downloadsFromCitations / apiUsageStats.useCount
        const authorshipWeight = downloadsFromAuthorships / apiUsageStats.useCount

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
        usage.softTurnaway = usage.fullSubscription - usage.ill
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
        usage.softTurnaway = usage.fullSubscription - usage.docdel
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



export {
    SubrTimeline,
    IllSubrTimeline,
    DocdelSubrTimeline,
}




































