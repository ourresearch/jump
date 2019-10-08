import _ from "lodash";
import {SubscriptionPackage} from "./subscription";
import {sumObjects} from "./util";


export default class ScenarioNew {
    constructor(journalsList) {
        this.journalsList = journalsList

    }

    getSubrTable(){
        const groups = this._getTimelinesByName()
        const groupCounts = _.mapValues(groups, g=>g.length)
        return groupCounts
    }

    getUsageByYear(){
        const ret = {}
        this._getYearsCovered().forEach(year=>{
            const thisYearUsagesList = this.journalsList.map(j=>{
                return j.selectedTimeline.getUsageYear(year)
            })

            ret[year] = thisYearUsagesList.reduce(sumObjects)
        })
        return ret
    }

    getUsageCounts(){
        return Object.values(this.getUsageByYear()).reduce(sumObjects)
    }
    getUsageTotal(){
        return Object.values(this.getUsageCounts()).reduce((a, b) => a + b)
    }

    getPercInstantAccess(){
        const usage = this.getUsageCounts()
        return 100 * (usage.fullSubscription + usage.docdel + usage.oa + usage.backCatalog) / this.getUsageTotal()
    }



    getCostByYear() {
        const groups = this._getTimelinesByName()

        const costsBySubr = _.mapValues(groups, timelinesList=>{  //  ill, docdel, and fullSubscription
            return timelinesList.map(t=>t.getCostByYear()).reduce(sumObjects)
        })
        const ret = {}
        Object.entries(costsBySubr).forEach(([name, costsByYear])=>{
            Object.entries(costsByYear).forEach(([year, cost]) => {
                if (!ret[year]) ret[year] = {}
                ret[year][name] = cost
            })
        })
        return ret
    }

    getCostTotal(){
        return this.journalsList.map(j=>j.selectedTimeline.getCostTotal()).reduce((a,b)=>a+b)
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