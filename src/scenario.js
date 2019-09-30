import _ from "lodash";
import {SubscriptionPackage} from "./subscription";


const makeScenario = function(journalsList, presetCost){



    const allYearSubscriptions = [].concat(...journalsList.map(x=>x.getYearlySubscriptions()))

    const subscriptionsDictByYear = _.groupBy(allYearSubscriptions, function(sub){
        return sub.year
    })

    const subscriptionYears = Object.entries(subscriptionsDictByYear).map(([year, subscriptionsList])=>{
        return new SubscriptionPackage(subscriptionsList, year)
    })

    const overallSubscription = new SubscriptionPackage(subscriptionYears)






    return {
        journals: journalsList,
        presetCost: presetCost,
        subscriptions: {
            overall: overallSubscription,
            byYear: subscriptionYears,
        },
        subrCounts: getJournalsByType(journalsList),
        usageByType: overallSubscription.getUsageStats(),
        costBySubr: overallSubscription.getCostBySubr(),
        costPerUseAdjustedBySubr: overallSubscription.getCostPerUseAdjBySubr(),

        costOverall: overallSubscription.cost,
        costPerUseAdjustedOverall: overallSubscription.cost / overallSubscription.getUseCountAdjusted(),

    }
}

const getJournalsByType = function(journalsList){
    const journalsCount = journalsList.length
    const groups = _.groupBy(journalsList, j=>{
        return j.subscription.name
    })

    const groupStats = Object.entries(groups).map(([subrName, journalsArr])=>{
        return {
            name: subrName,
            count: journalsArr.length,
            perc: 100 * journalsArr.length / journalsCount
        }
    })
    return groupStats

}

const getCostBySubr = function(journalsList, cost){


}


const makeScenarioComparison = function(newScenario, oldScenario){
    return {
        newScenario: newScenario,
        oldScenario: oldScenario
    }

}



export {
    makeScenario,
    makeScenarioComparison
}