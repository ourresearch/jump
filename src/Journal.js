import {makeSubscriptions, makeSubrYear} from "./subscription";

import {makeTimelines} from "./SubrTimeline";


class Journal {
    constructor(apiData, userSettings) {
        this.meta = apiData.meta
        this.userSettings = userSettings

        this.timelines = makeTimelines(
            apiData.yearlyDownloads,
            userSettings,
            apiData.fullSubrCost2018
        )
        this.selectedTimeline = this.timelines.ill




        this.sortKeys = {}
        this.apiData = apiData
        this.isSelected = false
        this.citations = apiData.citations
        this.subscription = {}
        this.fullSubrCost2018 = apiData.fullSubrCost2018

        this.yearlySubscriptions = []

        // hack
        this.useCount = apiData.subscriptions.find(x=>x.name==="fullSubscription").useCount()

        // legacy
        this.subscriptions = {
            selected: {
                name: "",
                overall: {},
            }
        }


        this.subscribe("ill")
    }

    getTotalDownloads(){
        return this.selectedTimeline.getUsageTotal()
    }

    getAdjUse(){
        return this.selectedTimeline.getNonfreeUsage()
    }

    getAdjSubrCost(){
        return this.timelines.fullSubscription.getCostTotal() - this.timelines.ill.getCostTotal()
    }
    getAdjSubrCPU(){
        return this.getAdjSubrCost() / this.getAdjUse()
    }
    getIllCost(){
        return this.timelines.ill.getCostTotal()
    }
    getDocdelCost(){
        return this.timelines.docdel.getCostTotal() - this.timelines.ill.getCostTotal()
    }



    subscribe(subscriptionName) {
        this.selectedTimeline = this.timelines[subscriptionName]

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
        this.sortKeys = {
            title: this.apiData.meta.title,
            subrCpua: this.getAdjSubrCPU() || 1000000000,
            totalUsage: this.getTotalDownloads()
        }
    }
}


export {
    Journal
}
