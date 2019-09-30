import {makeSubscriptions} from "./subscription";





class Journal {
    constructor(apiData, selectedSubscriptionName) {
        this.meta = apiData.meta
        this.sortKeys = {}
        this.apiData = apiData
        this.isSelected = false
        this.citations = apiData.citations
        this.subscription = {}
        this.fullSubrCost2018 = apiData.fullSubrCost2018

        // hack
        this.useCount = apiData.subscriptions.find(x=>x.name==="fullSubscription").useCount()

        // legacy
        this.subscriptions = {
            selected: {
                name: "",
                overall: {},
            }
        }


        this.subscribe(selectedSubscriptionName)
    }

    subscribe(subscriptionName) {
        const overall = this.apiData.subscriptions.find(mySub => {
                return mySub.name === subscriptionName
            })

        this.subscription = overall
        this._setSortKeys()

    }
    getAltSubrs(){
        return this.apiData.subscriptions.filter(subr=>{
            return subr.name !== this.subscription.name
        })
    }
    getSubrs(){
        return this.apiData.subscriptions
    }


    getYearlySubscriptions(){

        const ret = this.apiData.yearlyDownloads.map(yearInfo=>{
            // @todo make only the subsr of the type we want, not all of em
            const subs = makeSubscriptions(yearInfo, this.fullSubrCost2018, yearInfo.year)
            const mySub = subs.find(x => x.name === this.subscription.name)
            return mySub
        })
        return ret
    }

    _setSortKeys() {
        const costsPerPaidUse = this.apiData.subscriptions.map(sub => {
            return sub.costPerPaidUse()
        })

        const nonZeroCostsPerPaidUse = costsPerPaidUse.filter(x=>x>0)

        const bestCostPerPaidUse = Math.min(...nonZeroCostsPerPaidUse)
        // console.log("setting sort keys. costsPerPaidUse", costsPerPaidUse)
        // console.log("setting sort keys. nonZeroCostsPerPaidUse", nonZeroCostsPerPaidUse)
        // console.log("setting sort keys. bestCostPerPaidUse", bestCostPerPaidUse)

        // const bestCostPerPaidUse = Math.min(...this.subscriptions.possible.overall.map(sub => {
        //     console.log("looking at this subscription", sub, sub.costPerPaidUse())
        //     return sub.costPerPaidUse()
        // }))

        this.sortKeys = {
            hardTurnawayCount: this.subscription.usage.hardTurnaway,
            bestCostPerPaidUse: bestCostPerPaidUse,
            title: this.apiData.meta.title,
            totalUsage: this.subscription.useCount()
        }
    }
}


const makeJournal = function (apiData, selectedSubscriptionName) {

    const selectSubscription = function (subscriptionsList) {
        return subscriptionsList.find(mySub => {
            return mySub.name === selectedSubscriptionName
        })
    }

    // for each year, get the subscription type i have selected
    const yearSubscriptionsSelected = apiData.subscriptionsByYear.map(myYear => {
        const mySelectedSub = selectSubscription(myYear.subscriptions)
        mySelectedSub.year = myYear.year
        return mySelectedSub
    })
    const mySelectedSubscription = selectSubscription(apiData.subscriptions)
    const bestCostPerPaidUse = Math.min(...apiData.subscriptions.map(sub => {
        return sub.costPerPaidUse()
    }))

    return {
        meta: apiData.meta,
        subscriptions: {
            selected: {
                name: selectedSubscriptionName,
                overall: mySelectedSubscription,
                byYear: yearSubscriptionsSelected
            },
            possible: {
                overall: apiData.subscriptions,
                overallUsageStats: apiData.subscriptions.map(sub => {
                    return sub.selfStat()
                })

                // we never need all possible subscriptions by year
                // byYear: apiData.subscriptionsByYear
            }
        },
        sortKeys: {
            hardTurnawayCount: mySelectedSubscription.usage.hardTurnaway,
            bestCostPerPaidUse: bestCostPerPaidUse,
            title: apiData.meta.title

        }
    }
}


export {
    Journal
}
