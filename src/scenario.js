import _ from "lodash";
import {SubscriptionPackage} from "./subscription";

import {usageColors} from "./subscription";


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
        getSubrCount: getSubrCount,


        usageByType: overallSubscription.getUsageStats(),
        costBySubr: overallSubscription.getCostStats(),
        costPerUseAdjustedBySubr: overallSubscription.getCostPerUseAdjBySubr(),

        costOverall: overallSubscription.cost,
        costPerUseAdjustedOverall: overallSubscription.cost / overallSubscription.getUseCountAdjusted(),

    }
}

const getJournalsByType = function(journalsList){
    const groups = _.groupBy(journalsList, j=>{
        return j.subscription.name
    })

    const groupStats = Object.entries(groups).map(([subrName, journalsArr])=>{
        return {
            name: subrName,
            count: journalsArr.length,
        }
    })
    return groupStats
}


const getSubrCount = function(subrName){
    const groups = _.groupBy(journalsList, j=>{
        return j.subscription.name
    })
    if (groups[subrName]) {
        return groups[subrName].length
    }
    else {
        return 0
    }
}

const getCostStats = function(journalsList, cost){


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