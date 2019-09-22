import UsageReport from "./usageReport.js"
import SubscriptionSnap from "./SubscriptionSnap"





export default class Journal {
    constructor(apiData, subscriptionName) {


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

    getSubscriptionSnapsDict(){
        let ret = {}
        return this.usageByTypeByYear.forEach(usageYear=>{
            ret[usageYear.year] = new SubscriptionSnap(usageYear, this.subscriptionName, this.fullSubscriptionPrice)
        })
        return ret
    }


    getUsageReport(){
        const ret = new UsageReport()

        this.usageByTypeByYear.forEach(usageYear=>{
            ret.setYearSnapFromApiData(usageYear.year, usageYear, this.subscriptionName)
            ret.fullSubscriptionPrice = this.fullSubscriptionPrice
        })
        return ret
    }

}



