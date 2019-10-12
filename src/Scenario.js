import _ from "lodash";
import {sumObjects} from "./util";


class Scenario {
    constructor(journalsList, userSettings) {
        this.journalsList = journalsList
        this.isBigdeal = false
        this.userSettings = userSettings

        this.cache = {}

    }

    getSubrTable(){
        const groups = this._getTimelinesByName()
        const groupCounts = _.mapValues(groups, g=>g.length)
        return groupCounts
    }


    // usage methods

    getUsageByTypeByYear(){
        if (this.cache.getUsageByTypeByYear) return this.cache.getUsageByTypeByYear
        const ret = {}
        this._getYearsCovered().forEach(year=>{
            const thisYearUsagesList = this.journalsList.map(j=>{
                return j.selectedTimeline.getUsageYear(year)
            })

            ret[year] = thisYearUsagesList.reduce(sumObjects)
        })

        this.cache.getUsageByTypeByYear = ret
        return ret
    }

    getUsageByType(){
        const yearSums = Object.values(this.getUsageByTypeByYear()).reduce(sumObjects)
        return _.mapValues(yearSums, mySum=>{
            return mySum / 5
        })
    }
    getUsageTotal(){
        return Object.values(this.getUsageByType()).reduce((a, b) => a + b)
    }
    getUsageInstant(){
        const usage = this.getUsageByType()
        return usage.fullSubscription + usage.oa + usage.backCatalog + usage.rg
    }
    getUsageDelayed(){
        const usage = this.getUsageByType()
        return usage.ill + usage.docdel

    }
    getPercInstantAccess(){
        return 100 * this.getUsageInstant() / this.getUsageTotal()
    }



    // cost methods
    getCostByTypeByYear() {
        if (this.cache.getCostByTypeByYear) return this.cache.getCostByTypeByYear

        const groups = this._getTimelinesByName()

        const costsBySubr = _.mapValues(groups, timelinesList=>{  //  ill, docdel, and fullSubscription
            return timelinesList.map(t=>t.getCostByTypeByYear()).reduce(sumObjects)
        })
        const ret = {}
        Object.entries(costsBySubr).forEach(([name, costsByYear])=>{
            Object.entries(costsByYear).forEach(([year, cost]) => {
                if (!ret[year]) ret[year] = {}
                ret[year][name] = cost
            })
        })

        this.cache.getCostByTypeByYear = ret
        return ret
    }
    getCostByType(){
        // @todo get this from getCostByTypeByYear()

        const groups = this._getTimelinesByName()
        const costBySubr =  _.mapValues(groups, timelinesList=>{  //  ill, docdel, and fullSubscription
            return timelinesList.map(t=>t.getCostTotal() / 5).reduce((a,b)=>a+b)
        })
        return costBySubr
    }

    getCostTotal(){
        return Object.values(this.getCostByType()).reduce((a,b)=>a+b)
    }


    getCostPerInstantUse(){
        return this.getCostTotal() / this.getUsageInstant()
    }






    _getTimelinesByName(){
        const selectedTimelines = this.journalsList.map(j=>j.selectedTimeline)
        return _.groupBy(selectedTimelines, t=>{
            return t.name
        })
    }
    _getYearsCovered(){
        return this.journalsList[0].selectedTimeline.getYears()
    }

}

class BigDealScenario extends Scenario {
    constructor(journalsList, userSettings) {
        super(journalsList, userSettings);
    }


    getCostTotal(){
        let years = {}
        let costThisYear = this.userSettings.bigDealCost
        this._getYearsCovered().forEach(y=>{
            years[y] = costThisYear
            costThisYear = costThisYear + (costThisYear * this.userSettings.bigDealCostAnnualIncrease)
        })
        return Object.values(years).reduce((a,b)=>a+b) / 5
    }
}




export {
    Scenario,
    BigDealScenario
}