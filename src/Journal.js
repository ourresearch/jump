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


        this.apiData = apiData
        this.isSelected = false
        this.citations = apiData.citations
        this.authorships = apiData.authorships

        this.isExpanded = false
    }

    getSubr(){
        const mySubrName = this.userSettings.getSubr(this.meta.issnl)
        if (this.userSettings.hash !== 999999999){
            return this.timelines[mySubrName]
        }
    }



    // @todo delete
    getTotalDownloads(){
        return Math.round(this.getSubr().getAnnualUsageTotal())
    }
    getAnnualRawDownloadsTotal(){
        return Math.round(_.sum(this.apiData.yearlyDownloads.map(year=>year.useCount)) / 5 || 0)
    }

    // @todo delete
    getAdjUse(){
        return this.getSubr().getNegotiableUsage()
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
        return this.timelines.fullSubscription.getCostTotal() < this.getSubr().getCostTotal()
    }

    getFullSubrCostAboveIll(){
        return this.timelines.fullSubscription.getCostTotal() - this.timelines.ill.getCostTotal()
    }
    getSubscriptionRealCPU(){
        const ret = this.getFullSubrCostAboveIll() / this.timelines.fullSubscription.getNegotiableUsage()
        return ret
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


    getSortFn(name){
        return {
            title: () => this.apiData.meta.title,
            totalUsage: ()=> this.getTotalDownloads(),
            citations: () => this.citations,
            bestCpnu: () => {
              return this.getCheapestTimeline().getCostPerNegotiableUse()|| 1000000000
            },
            bestCpnuNoIll: () => {
              return this.getCheapestTimeline(true).getCostPerNegotiableUse()|| 1000000000
            }
        }[name];
    }
}


class FullSubscriptionJournal extends Journal {
    getSubr(){
        return this.timelines["fullSubscription"]
    }
}



export {
    Journal,
    FullSubscriptionJournal
}
