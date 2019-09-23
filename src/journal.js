import _ from 'lodash'


import SubscriptionSnap from "./SubscriptionSnap"
import SummarySnap from "./SummarySnap"
import {makeMods} from "./BaseSnap";







export default class Journal {
    constructor(apiData, subscriptionName) {

        this.apiData = apiData
        this.meta = apiData.meta
        this.subscriptionName = subscriptionName || "free"
        this.usageByTypeByYear = apiData.usageByTypeByYear
        this.fullSubscriptionPrice = apiData.fullSubscriptionPrice || 0


        // testing caching thing
        this.subscriptionSnaps = this.usageByTypeByYear.map(usageYear=>{
            return new SubscriptionSnap(usageYear, this.subscriptionName, this.fullSubscriptionPrice)
        })
        this.summary = new SummarySnap(this.subscriptionSnaps)

    }


    getSubscriptionSnaps(){
        return this.subscriptionSnaps

        //
        // return this.usageByTypeByYear.map(usageYear=>{
        //     return new SubscriptionSnap(usageYear, this.subscriptionName, this.fullSubscriptionPrice)
        // })
    }

    getSummary(){
        return this.summary

        // return new SummarySnap(this.getSubscriptionSnaps())
    }




    // subscribe(newSubscriptionName){
    //     this.subscriptionName = newSubscriptionName
    //
    //     testing caching thing
    //     this.subscriptionSnaps = this.usageByTypeByYear.map(usageYear=>{
    //         return new SubscriptionSnap(usageYear, this.subscriptionName, this.fullSubscriptionPrice)
    //     })
    //     this.summary =  new SummarySnap(this.subscriptionSnaps)
    // }



    isSubscribedTo(name){
        return this.subscriptionName === name
    }


    getBestCostPerPaidUse(){
        const costs = this.getHypotheticalSubscriptionMods()
            .map(x=>x.costPerCount)
        return Math.min(...costs)
    }
    getUseCount(){
        return this.getSummary().getCount()
    }
    getHardTurnawayCount(){
        return this.getSummary().getHardTurnawayCount()
    }



    getHypotheticalSubscriptionMods(){
        // return this.hypotheticalSubscriptionMods

        return ["fullSubscription", "docdel"]
            .map(newSubscriptionName => {
                // make a new journal with this subscription
                const hypotheticalJournal = new Journal(this.apiData, newSubscriptionName)
                const hypotheticalUses = hypotheticalJournal.getSummary().getUses()

                return hypotheticalUses[newSubscriptionName]

            })
    }


}



