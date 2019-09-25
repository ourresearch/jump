import {AccumulatorSubscription} from "./subscription";


const makeScenario = function(journalsList, presetCost){

    const subscriptions = journalsList.map(x=>x.subscriptions.selected.overall)

    return {
        journals: journalsList,
        presetCost: presetCost,
        subscriptions: {
            overall: new AccumulatorSubscription(subscriptions)
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