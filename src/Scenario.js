import _ from "lodash";
import {sumObjects} from "./util";


export default class Scenario {
    constructor(journalsList, userSettings, isBigDeal) {
        this.journalsList = journalsList
        this.isBigdeal = isBigDeal
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
    getPercInstantAccess(){
        const usage = this.getUsageByType()
        return 100 * (usage.fullSubscription + usage.docdel + usage.oa + usage.backCatalog) / this.getUsageTotal()
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