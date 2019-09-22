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
        if (isNaN(this.subscriptionPrice)){
            console.log("we have a NaN subscription price", this.apiData, this.subscriptionPrice, this.subscriptionPrice)
            throw("wtf there is no subscription price")
        }
        return makeMods(this.apiData, this.subscriptionName, this.subscriptionPrice)
    }




}



