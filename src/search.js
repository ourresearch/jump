import axios from 'axios'
import _ from 'lodash'

import {resp} from "./journalsRespMock.js"









class Snap {
    constructor() {
        this.rawDownloads =  {
            backCatalog: 0,
            oa: 0,
            closed: 0
        }
        this.price = 0
    }

    getDownloadsSum(){
        return Object.values(this.rawDownloads).reduce((a,b)=>a+b)
    }

    getDownloadsPerc(){
        let ret = {}
        let myDownloads = this.getDownloads()
        Object.keys(myDownloads).forEach(k=>{
            ret[k] = 100 * myDownloads[k] / this.getDownloadsSum()
        })
        return ret
    }
    getDownloads(){
        console.log("Snap.getDownloads() need to be overridden")
    }

    getCostPerClosedDownload(){
        return this.price / this.rawDownloads.closed
    }

    addSnap(snap){
        console.log("Snap.addSnap() need to be overridden")
    }
}




class ScenarioSnap extends Snap {
    constructor(){
        super()
        this.numDownloadsPurchased = 0
    }
    getDownloads(){
        let ret = {
            backCatalog: this.rawDownloads.backCatalog,
            oa: this.rawDownloads.oa
        }
        let numDownloadsWithAccess = Object.values(ret).reduce((a,b)=>a+b)
        let numPurchasable = this.getDownloadsSum() - numDownloadsWithAccess

        ret.purchased = this.numDownloadsPurchased
        ret.turnaway = numPurchasable -this.numDownloadsPurchased

        return ret
    }

    addSnap(snap) {
        Object.keys(snap.rawDownloads).forEach(k=> {
            this.rawDownloads[k] += snap.rawDownloads[k]
        })
        this.price += snap.price
        console.log("adding a snap", this.price)
        if (snap.isFullySubscribed){
            this.numDownloadsPurchased += snap.getDownloadsSum()
        }

    }
}



class JournalSnap extends Snap {
    constructor(){
        super()
        this.isFullySubscribed = true
    }
    getDownloads(){
        let ret = {
            backCatalog: this.rawDownloads.backCatalog,
            oa: this.rawDownloads.oa
        }
        let numDownloadsWithAccess = Object.values(ret).reduce((a,b)=>a+b)
        let numPurchasable = this.getDownloadsSum() - numDownloadsWithAccess

        if (this.isFullySubscribed){
            ret.purchased = numPurchasable
        }
        else {
            ret.turnaway = numPurchasable
        }
        return ret
    }
    addSnap(snap) {
        Object.keys(snap.rawDownloads).forEach(k=> {
            this.rawDownloads[k] += snap.rawDownloads[k]
        })
        this.price += snap.price
    }
}



class JournalSnapTimeline {
    constructor(){
        this.snaps = {}
        this.subscribed = true
    }

    getSummarySnap(){
        let ret = new JournalSnap()
        Object.values(this.snaps).forEach(snap=>{
            ret.addSnap(snap)
        })
        ret.isFullySubscribed = this.subscribed
        return ret
    }

    getSnaps(){
        return Object.keys(this.snaps).map(k=>{
            let mySnap = this.snaps[k]
            mySnap.isFullySubscribed = this.subscribed
            mySnap.year = k
            return mySnap
        })
    }
}




class ScenarioSnapTimeline{
    constructor(looseSnaps) {
        this.looseSnaps = looseSnaps
    }

    getSnapsByYear(){
        let ret = {}
        this.looseSnaps.forEach(snap=>{
            if (!ret[snap.year]){
                ret[snap.year] = []
            }
            ret[snap.year].push(snap)
        })
        return ret
    }

    getSummarySnap(){
        let ret = new ScenarioSnap()
        this.looseSnaps.forEach(snap=>{
            ret.addSnap(snap)
        })
        return ret
    }

    getSnaps(){
        let snapsByYear = this.getSnapsByYear()
        let ret = {}
        Object.keys(snapsByYear).map(year => {
            let yearSumSnap = new ScenarioSnap()
            snapsByYear[year].forEach(snap=>{
                yearSumSnap.addSnap(snap)
            })
            yearSumSnap.year = year
            ret[year] = yearSumSnap
        })

        return Object.values(ret)
    }

}




function makeJournalSnapTimeline(journal){
    let snaps = {}
    journal.downloads_by_year.year.forEach((year, i)=>{
        let snap = new JournalSnap()
        snap.rawDownloads = {
            backCatalog: journal.downloads_by_year.back_catalog[i],
            oa: journal.downloads_by_year.oa[i],
            closed: journal.downloads_by_year.turnaways[i],
        }
        snap.price = journal.dollars_2018_subscription
        snaps[year] = snap
    })

    let timeline = new JournalSnapTimeline()
    timeline.snaps = snaps
    return timeline
}


function makeScenarioSnapTimeline(journals) {
    let looseSnaps = []
    journals.forEach(journal => {
        looseSnaps.push(...journal.timeline.getSnaps())
    })
    return new ScenarioSnapTimeline(looseSnaps)
}






export const store = {
    loadingState: "ready",
    journalsCount: 0,
    journals: [],
    baseUrl: "https://rickscafe-api.herokuapp.com/jump/temp",
    page: 1,
    pageSize: 10,


    // this is for if you are doing filtering on the server, so you are making
    // a new API call to reflect the current state of the search params.
    getApiUrl: function () {
        return this.baseUrl
    },

    reset(){
        this.journals = []
        this.resultsCount = 0
    },

    getSorted: function(){




        // let fn = function(a, b){
        //     return a.windowTotals.pricePer.requestedItem - b.windowTotals.pricePer.requestedItem
        // }
        // this.journals.sort(fn)

        let startIndex = (this.page - 1) * this.pageSize
        let endIndex = (this.page * this.pageSize) - 1

        return this.journals.slice(startIndex, endIndex)
    },

    getNumPages: function(){
        return Math.ceil(this.journals.length / this.pageSize)
    },

    getNewScenario: function(){
        return makeScenarioSnapTimeline(this.journals)
    },

    fetchResults: function () {

        this.loadingState = "loading"
        let url = this.getApiUrl()
        console.log("fetching journals from", url)

        let request = axios.get(url)
            .then(resp => {
                console.log("got journals back")
                this.journals = resp.data.list.map(journal => {
                    journal.timeline = makeJournalSnapTimeline(journal)
                    return journal
                })

                // make a baseline here, using a deep copy of the response
                this.baselineScenario = makeScenarioSnapTimeline(this.journals)
            })
            .catch(e => {
                console.log("journals API error", e)
            })
            .finally(() => {
                this.loadingState = "complete"
            })
        return request
    },

}







let downloads_by_year = {
    back_catalog: [
        47889,
        38643,
        31629,
        25658,
        20543
    ],
    oa: [
        13073,
        20623,
        27121,
        33091,
        38206
    ],
    total: [
        86722,
        86722,
        86722,
        86722,
        86722
    ],
    turnaways: [
        25759,
        27454,
        27970,
        27972,
        27972
    ],
    year: [
        2020,
        2021,
        2022,
        2023,
        2024
    ]
}