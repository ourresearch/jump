import SubscriptionSnap from "./SubscriptionSnap"
import SummarySnap from "./SummarySnap"
import {makeMods} from "./BaseSnap";





export default class Journal {
    constructor(apiData, subscriptionName) {

        this.apiData = apiData
        this.meta = apiData.meta
        this.subscriptionName = subscriptionName || "free"
        this.usageByTypeByYear = apiData.usageByTypeByYear
        this.fullSubscriptionPrice = apiData.fullSubscriptionPrice
    }

    subscribe(newSubscriptionName){
        this.subscriptionName = newSubscriptionName
    }

    getSubscriptionSnaps(){
        return this.usageByTypeByYear.map(usageYear=>{
            return new SubscriptionSnap(usageYear, this.subscriptionName, this.fullSubscriptionPrice)
        })
    }

    getSummary(){
        return new SummarySnap(this.getSubscriptionSnaps())
    }

    getHypotheticalSubscriptionMods(){
        return ["fullSubscription", "docdel"]
            .filter(x => x !== this.subscriptionName)
            .map(newSubscriptionName => {
                // make a new journal with this subscription
                const hypotheticalJournal = new Journal(this.apiData, newSubscriptionName)
                const hypotheticalUses = hypotheticalJournal.getSummary().getUses()

                return hypotheticalUses[newSubscriptionName]

            })
    }


}




function makePotentialUses(journalYears) {
    const journalYearsSum = journalYears.reduce(sumJournalYears)

    return ["fullSubscription", "docdel"]
        .filter(x => x !== journalYearsSum.subscribedTo)
        .map(potentialSubscriptionName => {
            // make full of this type
            const newJournalYear = {...journalYearsSum}
            newJournalYear.subscribedTo = potentialSubscriptionName
            return makeMods(newJournalYear)
                .find(mod => {
                    // only return the subscription use, not all of them.
                    return mod.name === potentialSubscriptionName
                })
        })
}
