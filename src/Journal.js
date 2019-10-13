import {SubrTimeline, IllSubrTimeline, DocdelSubrTimeline} from "./SubrTimeline";


class Journal {
    constructor(apiData, userSettings) {
        this.meta = apiData.meta
        this.userSettings = userSettings

        this.timelines = {
            fullSubscription: new SubrTimeline(apiData, userSettings),
            ill: new IllSubrTimeline(apiData, userSettings),
            docdel: new DocdelSubrTimeline(apiData, userSettings),
        };


        this.selectedTimeline = this.timelines.ill
        this.sortKeys = {}
        this.apiData = apiData
        this.isSelected = false
        this.citations = apiData.citations
        this.authorships = apiData.authorships

        this.isExpanded = false

        this.subscribe("ill")
    }

    getTotalDownloads(){
        return Math.round(this.selectedTimeline.getAnnualUsageTotal())
    }
    getAnnualRawDownloadsTotal(){
        return Math.round(_.sum(this.apiData.yearlyDownloads.map(year=>year.useCount)) / 5 || 0)
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

    isOverpaid(){
        return this.timelines.fullSubscription.getCostTotal() < this.selectedTimeline.getCostTotal()
    }

    getFullSubrCostAboveIll(){
        return this.timelines.fullSubscription.getCostTotal() - this.timelines.ill.getCostTotal()
    }

    getCheapestCost(){
        return this.getCheapestTimeline(false).getCostTotal()
    }
    getCheapestTimelineName(){
        return this.getCheapestTimeline(false).name
    }


    getCheapestTimeline(docdelOnly){
        const filtered =  Object.values(this.timelines).filter(timeline=>{
            if (docdelOnly && timeline.name==='ill') {
                return false
            }
            else {
                return true
            }
        })
        let sorted = filtered.sort((a,b)=>{
                return a.getCostTotal() - b.getCostTotal()
        })
        return sorted[0]
    }


    subscribeToCheapest(docdelOnly=false){
        this.subscribe(this.getCheapestTimeline(docdelOnly).name)
    }

    subscribe(subscriptionName) {
        this.selectedTimeline = this.timelines[subscriptionName]
        this._setSortKeys()
    }

    _setSortKeys() {
        this.sortKeys = {
            title: this.apiData.meta.title,
            totalUsage: this.getTotalDownloads(),
            citations: this.citations,
            bestCpnu: this.getCheapestTimeline().getCostPerNegotiableUse()|| 1000000000,
            bestCpnuNoIll: this.getCheapestTimeline(true).getCostPerNegotiableUse()|| 1000000000,
        }
    }
}


export {
    Journal
}
