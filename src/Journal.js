import {makeTimelines} from "./SubrTimeline";


class Journal {
    constructor(apiData, userSettings) {
        this.meta = apiData.meta
        this.userSettings = userSettings

        this.timelines = makeTimelines(
            apiData.yearlyDownloads,
            3,
            userSettings,
            apiData.fullSubrCost2018
        )
        this.selectedTimeline = this.timelines.ill
        this.sortKeys = {}
        this.apiData = apiData
        this.isSelected = false
        this.citations = apiData.citations

        this.subscribe("ill")
    }

    getTotalDownloads(){
        return this.selectedTimeline.getUsageTotal()
    }

    getAdjUse(){
        return this.selectedTimeline.getNegotiableUsage()
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
        this._setSortKeys()
    }


    _setSortKeys() {
        this.sortKeys = {
            title: this.apiData.meta.title,
            subrCpua: this.getAdjSubrCPU() || 1000000000,
            totalUsage: this.getTotalDownloads(),
            citations: this.citations,
        }
    }
}


export {
    Journal
}
