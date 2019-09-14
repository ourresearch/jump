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

        // price never changes
        this.price = 0

        // cost changes depending on subscription status
        this.subscribed = true
        this.cost = 0

    }

    getDownloadsSum(){
        return Object.values(this.rawDownloads).reduce((a,b)=>a+b)
    }

    getClassName(){
        return this.constructor.name
    }


    getDownloadsPerc(){
        let ret = {}
        let myDownloads = this.getDownloads()
        Object.keys(myDownloads).forEach(k=>{
            ret[k] = 100 * myDownloads[k] / this.getDownloadsSum()
        })
        return ret
    }
    getDownloads() {
        console.log("Snap.getDownloads() need to be overridden")
        return null
    }

    getDict(){
        return {
            downloads: this.getDownloads(),
            price: this.price,
            cost: this.cost,
            subscribed: this.subscribed,

            downloadsPerc: this.getDownloadsPerc(),
            downloadsClosed: this.rawDownloads.closed,
            downloadsSum: this.getDownloadsSum(),

            costPerPurchasedUse: this.cost / this.getDownloads().purchased,
            pricePerPurchasedUse: this.price / this.rawDownloads.closed,

            isJournal: this.constructor.name === "JournalSnap",
            isScenario: this.constructor.name === "ScenarioSnap"
        }
    }

    addSnap(snap){
        console.log("Snap.addSnap() need to be overridden")
    }

}




class ScenarioSnap extends Snap {
    constructor(){
        super()
        this.numDownloadsPurchased = 0

        this.cost = 0
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

    // i think having an add(a, b) function might be better, so we don't have to carry state?
    addSnap(snap) {
        Object.keys(snap.rawDownloads).forEach(k=> {
            this.rawDownloads[k] += snap.rawDownloads[k]
        })


        if (snap.subscribed){
            this.numDownloadsPurchased += snap.rawDownloads.closed
            this.cost += (snap.price || 0)
        }

        this.price += (snap.price || 0)

    }
}



class JournalSnap extends Snap {
    constructor(){
        super()
        this.subscribed = true
    }
    getDownloads(){
        let ret = {
            backCatalog: this.rawDownloads.backCatalog,
            oa: this.rawDownloads.oa
        }
        let numDownloadsWithAccess = Object.values(ret).reduce((a,b)=>a+b)
        let numPurchasable = this.getDownloadsSum() - numDownloadsWithAccess

        if (this.subscribed){
            ret.purchased = numPurchasable
            ret.turnaway = 0
        }
        else {
            ret.turnaway = numPurchasable
            ret.purchased = 0
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
        ret.subscribed = this.subscribed
        return ret
    }


    getSnaps(){
        return Object.keys(this.snaps).map(k=>{
            let mySnap = this.snaps[k]
            mySnap.subscribed = this.subscribed
            mySnap.year = k
            return mySnap
        })
    }

    getSnapsDicts(){
        return this.getSnaps().map(snap => snap.getDict())
    }
    getSummarySnapDict(){
        return this.getSummarySnap().getDict()
    }
}




class ScenarioSnapTimeline{
    constructor(looseSnaps, hardCodePrice) {
        this.looseSnaps = looseSnaps
        this.hardCodedPrice = hardCodePrice
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

        if (this.hardCodedPrice){
            ret.price = this.hardCodedPrice
        }

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

    getSnapsDicts(){
        return this.getSnaps().map(snap => snap.getDict())
    }


    getSnapsDicts(){
        return this.getSnaps().map(snap => snap.getDict())
    }
    getSummarySnapDict(){
        return this.getSummarySnap().getDict()
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


function makeScenarioSnapTimeline(journals, hardCodedPrice) {
    let looseSnaps = []
    journals.forEach(journal => {
        looseSnaps.push(...journal.timeline.getSnaps())
    })
    return new ScenarioSnapTimeline(looseSnaps, hardCodedPrice)
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

                // make the baseline scenario
                let respDeepCopy = JSON.parse(JSON.stringify(resp.data.list))
                let journalsDeepCopy = respDeepCopy.map(journal => {
                    journal.timeline = makeJournalSnapTimeline(journal)
                    return journal
                })
                this.baselineScenario = makeScenarioSnapTimeline(
                    journalsDeepCopy,
                    1000000
                )


                this.journals = resp.data.list.map(journal => {
                    journal.timeline = makeJournalSnapTimeline(journal)
                    return journal
                })
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