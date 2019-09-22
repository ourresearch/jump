import {BaseSnap, makeMods} from "./BaseSnap"


const docDelPricePerUse = 25
const hardTurnawayProp = 0.1

export default class SubscriptionSnap extends BaseSnap{
    constructor(apiData, subscriptionName, fullSubscriptionPrice) {
        super()

        this.apiData = apiData
        this.subscriptionName = subscriptionName
        this.subscriptionPrice = fullSubscriptionPrice
        this.year = apiData.year
    }


    getRawUses() {
        return makeMods(this.apiData, this.subscriptionName, this.subscriptionPrice)
    }

    subscribe(name, price) {
        this.subscriptionName = name
        this.subscriptionPrice = price || 0
    }



}



