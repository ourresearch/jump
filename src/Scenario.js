import _ from "lodash";
import {sumObjects} from "./util";
import {FullSubscriptionJournal, Journal} from "./Journal";


class Scenario {
    constructor(userSettings) {
        this.userSettings = userSettings
        this.journals = []

    }

    setJournals(apiJournals) {
        this.journals = apiJournals.map(j => {
            return new Journal(j, this.userSettings)
        })
    }


    getSubrTable() {
        const groups = this._getTimelinesByName()
        const groupCounts = _.mapValues(groups, g => g.length)
        return groupCounts
    }


    // usage methods

    getUsageByTypeByYear() {
        const ret = {}
        this._getYearsCovered().forEach(year => {
            const thisYearUsagesList = this.journals.map(j => {
                return j.getSubr().getUsageYear(year)
            })

            ret[year] = thisYearUsagesList.reduce(sumObjects)
        })

        // return format looks like this:
        const exampleReturn = {
            2020: {fullSubscription: 12, ill: 42},
            2021: {fullSubscription: 32, ill: 49},
        }


        return ret
    }

    getUsageByType() {
        const yearSums = Object.values(this.getUsageByTypeByYear()).reduce(sumObjects)
        return _.mapValues(yearSums, mySum => {
            return mySum / 5
        })
    }

    getAnnualUsageTotal() {
        return Object.values(this.getUsageByType()).reduce((a, b) => a + b)
    }

    getUsageFreeInstant(){
        const usage = this.getUsageByType()
        return usage.oa + usage.backCatalog + usage.rg
    }
    getUsagePaidInstant() {
        const usage = this.getUsageByType()
        return usage.fullSubscription + usage.docdel

    }

    getUsageDelayed(){
        const usage = this.getUsageByType()
        return usage.ill + usage.softTurnaway
    }


    getUsageInstant() {
        const usage = this.getUsageByType()
        return usage.fullSubscription + usage.oa + usage.backCatalog + usage.rg + usage.docdel
    }

    getPercInstantAccess() {
        return 100 * this.getUsageInstant() / this.getAnnualUsageTotal()
    }


    // cost methods
    getCostByTypeByYear() {

        const groups = this._getTimelinesByName()

        const costsBySubr = _.mapValues(groups, timelinesList => {  //  ill, docdel, and fullSubscription
            return timelinesList.map(t => t.getCostByTypeByYear()).reduce(sumObjects)
        })
        const ret = {}
        Object.entries(costsBySubr).forEach(([name, costsByYear]) => {
            Object.entries(costsByYear).forEach(([year, cost]) => {
                if (!ret[year]) ret[year] = {}
                ret[year][name] = cost
            })
        })
        return ret
    }

    getCostByType() {
        // @todo get this from getCostByTypeByYear()

        const groups = this._getTimelinesByName()
        const costBySubr = _.mapValues(groups, timelinesList => {  //  ill, docdel, and fullSubscription
            return timelinesList.map(t => t.getCostTotal()).reduce((a, b) => a + b, 0)
        })
        return costBySubr
    }

    getCostTotal() {
        return this.journals.map(j => j.getSubr().getCostTotal()).reduce((a, b) => a + b, 0)
        return Object.values(this.getCostByType()).reduce((a, b) => a + b, 0)
    }


    getCostPerInstantUse() {
        return this.getCostTotal() / this.getUsageInstant()
    }

    getCheapestCost() {
        return _.sum(this.journals.map(j => j.getCheapestCost()));
    }


    /// selection methods
    getSelectedJournals() {
        return this.journals.filter(j => j.isSelected)
    }


    setSubr(issnl, subr){
        this.userSettings.setSubr(issnl, subr)
    }

    setSubrsToCheapest(maxCost) {
        // how much are we spending?
        let costSoFar = this.getCheapestCost()
        if (!maxCost) maxCost = costSoFar

        console.log("setting new subscriptions. max cost: ", maxCost)

        this.journals.forEach(j => {
            let mySubr
            const fullSubrCostAboveIll = j.getFullSubrCostAboveIll()
            if (costSoFar < maxCost && fullSubrCostAboveIll > 0) {
                mySubr = "fullSubscription"
                costSoFar += fullSubrCostAboveIll
            } else {
                mySubr = j.getCheapestTimelineName()
                // no need to add or subtract to cost because the costsSoFar variable we are using
                // was already the sum of all the cheapest costs.
            }
            this.userSettings.setSubr(j.meta.issnl, mySubr)
        })

    }


    /// page display methods
    getFilteredJournals() {
        const ret = this.userSettings.journalSorter.sortJournals(this.journals)
        return ret

    }


    /// sorting


    _getTimelinesByName() {
        const selectedTimelines = this.journals.map(j => j.getSubr())
        return _.groupBy(selectedTimelines, t => {
            return t.name
        })
    }

    _getYearsCovered() {
        return this.journals[0].getSubr().getYears()
    }

}

class BigDealScenario extends Scenario {
    constructor(userSettings) {
        super(userSettings);
    }


    setJournals(apiJournals) {
        this.journals = apiJournals.map(j => {
            return new FullSubscriptionJournal(j, this.userSettings)
        })
    }

    getCostTotal() {
        let years = {}
        let costThisYear = this.userSettings.bigDealCost
        this._getYearsCovered().forEach(y => {
            years[y] = costThisYear
            costThisYear = costThisYear + (costThisYear * this.userSettings.bigDealCostAnnualIncrease)
        })
        return Object.values(years).reduce((a, b) => a + b) / 5
    }
}


export {
    Scenario,
    BigDealScenario
}