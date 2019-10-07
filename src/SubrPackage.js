
class SubscriptionPackage {
    constructor(userSettings, year) {
        this.name = "accumulator"
        this.year = year


        // @todo find a way to make subsrs
        // this.subscriptions = makeBlankSubscriptions(year)
        //
        // subsToAdd.forEach(sub => {
        //     this.addSubscriptionObj(sub)
        // })
    }


    addSubscriptionObj(newSub) {
        if (newSub.name === "accumulator") {
            this.addAccumulator(newSub)
        } else {
            this.subscriptions.find(x => x.name === newSub.name).addSubscriptionObj(newSub)
            Object.entries(newSub.usage).forEach(([k, v]) => {
                this.usage[k] += v
            })
            this.cost += newSub.cost

        }
    }

    addAccumulator(accumulator) {
        accumulator.subscriptions.forEach((sub) => {
            this.addSubscriptionObj(sub)
        })
    }


    getSubscription(name) {
        return this.subscriptions.find(x => x.name === name)
    }

    getCostForUsageType(usageType) {
        if (["fullSubscription", "docdel", "ill"].includes(usageType)) {
            return this.getSubscription(usageType).cost
        } else {
            return 0
        }
    }

    getCostStats() {
        return this.subscriptions.map(subr => {
            return {
                name: subr.name,
                displayName: subr.displayName,
                count: subr.cost,
                color: subr.getPrimaryColor(),
                fillColor: subr.getFillColor(),
                perc: 100 * subr.cost / this.cost
            }
        })
    }

    getSubrStats() {
        return this.subscriptions.map(subr => {
            return {
                name: subr.name,
                displayName: subr.displayName,
                count: subr.count,
                color: subr.getPrimaryColor(),
                fillColor: subr.getFillColor(),
                perc: 100 * subr.count / this.count
            }
        })
    }

    getCostPerUseAdjBySubr() {
        return this.subscriptions.map(subr => {
            return {
                name: subr.name,
                cost: subr.getCostPerUseAdj()
            }
        })
    }


}