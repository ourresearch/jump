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
        }

    }
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