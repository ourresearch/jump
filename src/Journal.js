




class Journal {
    constructor(apiData, selectedSubscriptionName) {
        this.meta = apiData.meta
        this.sortKeys = {}
        this.apiData = apiData
        this.subscriptions = {
            selected: {
                name: "",
                overall: {},
                byYear: []
            },
            possible: {
                overall: {},
                overallUsageStats: []
            }
        }

        this._setPossibleSubscriptions()
        this.subscribe(selectedSubscriptionName)
    }

    subscribe(subscriptionName) {

        const selectSubscription = function (subscriptionsList) {
            return subscriptionsList.find(mySub => {
                return mySub.name === subscriptionName
            })
        }

        // for each year, get the subscription type i have selected
        const yearlySubscriptionsSelected = this.apiData.subscriptionsByYear.map(myYear => {
            const mySelectedSub = selectSubscription(myYear.subscriptions)
            mySelectedSub.year = myYear.year
            return mySelectedSub
        })

        const overall = selectSubscription(this.apiData.subscriptions)

        this.subscriptions.selected = {
            name: subscriptionName,
            overall: overall,
            byYear: yearlySubscriptionsSelected
        }
        this._setSortKeys()
    }

    _setPossibleSubscriptions(){
        this.subscriptions.possible = {
            overall: this.apiData.subscriptions,
            overallUsageStats: this.apiData.subscriptions.map(sub => {
                    return sub.selfStat()
                })
        }
    }

    _setSortKeys() {
        const bestCostPerPaidUse = Math.min(...this.apiData.subscriptions.map(sub => {
            return sub.costPerPaidUse()
        }))

        this.sortKeys = {
            hardTurnawayCount: this.subscriptions.selected.overall.usage.hardTurnaway,
            bestCostPerPaidUse: bestCostPerPaidUse,
            title: this.apiData.meta.title
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
    makeJournal,
    Journal
}
