import {BaseSnap, makeMods} from "./BaseSnap"


const docDelPricePerUse = 25
const hardTurnawayProp = 0.1

export default class SubscriptionSnap extends BaseSnap{
    constructor(apiData, subscriptionName, fullSubscriptionPrice) {
        super()

        console.log("making new SubscriptionSnap", apiData, subscriptionName, fullSubscriptionPrice)

        this.apiData = apiData
        this.subscriptionName = subscriptionName
        this.subscriptionPrice = fullSubscriptionPrice
        this.year = apiData.year
    }

    getUses() {
        const ret = makeMods(this.apiData, this.subscriptionName, this.subscriptionPrice)
        return this._addSummaryStats(ret)
    }

    subscribe(name, price) {
        this.subscriptionName = name
        this.subscriptionPrice = price || 0
    }


    _addSummaryStats(modsDict, totalCount) {
        const ret = {...modsDict}
        Object.keys(ret).forEach(k => {
            ret[k].prop = ret[k].count / totalCount
            ret[k].pricePerCount = ret[k].price / ret[k].count
        })
        return ret
    }
}



