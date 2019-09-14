import axios from 'axios'
import _ from 'lodash'

import {resp} from "./journalsRespMock.js"








class DownloadSnap{
    constructor(downloads, cost){
        this.purchasedAdjFactor = 0.1
        this.docdelCostPerUse = 25
        this.raw = {
            backCatalog: 0,
            oa: 0,
            turnaway: 0,
            purchased: 0
        }

        Object.keys(this.raw).forEach(x => {
            this.raw[x] = 0
        })
        this.cost = 0
        this.prop = {}
        this.pricePer = {}

        if (downloads && cost){
            this.add(downloads, cost)
        }
    }


    add(downloads, cost){
        this.cost += cost

        Object.keys(this.raw).forEach(x => {
            this.raw[x] += downloads[x]
        })
        this.total = this.raw.backCatalog + this.raw.oa + this.raw.turnaway + this.raw.purchased

        Object.keys(this.raw).forEach(x => {
            this.prop[x] = this.raw[x] / this.total
        })

        this.pricePer = {
            download: cost /  this.total,
            purchased: cost / this.raw.purchased,
            adjPurchased: cost / (this.raw.purchased * this.purchasedAdjFactor)
        }

        // this.docdelCost = this.docdelCostPerUse * this.raw.turnaway * this.purchasedAdjFactor
        // this.docdelSavings = this.cost - this.docdelCost
    }
}

function addDownloadSnaps(a, b){
    a.add(b.raw, b.cost)
    return a
}




function makeSnapTimelineFromApi(apiTimeline, price){
    let ret = []
    apiTimeline.year.forEach((year, i) => {

        let downloads = {
            backCatalog: apiTimeline.back_catalog[i],
            oa: apiTimeline.oa[i],
            purchased: apiTimeline.turnaways[i],
            turnaway: 0
        }
        let mySnap = new DownloadSnap(downloads, price)
        mySnap.year = year
        ret.push(mySnap)
    })
    return ret
}

function makeSnapsFromApi(apiTimeline, price){
    let ret = []
    apiTimeline.year.forEach((year, i) => {

        let downloads = {
            backCatalog: apiTimeline.back_catalog[i],
            oa: apiTimeline.oa[i],
            purchased: apiTimeline.turnaways[i],
            turnaway: 0
        }
        let mySnap = new DownloadSnap(downloads, price)
        mySnap.year = year
        ret.push(mySnap)
    })
    return ret
}

function makeScenario(snaps){
    let ret = {
        years: makeSnapTimelineFromSnaps(snaps),
        overall: combineSnaps(snaps)
    }
    return ret
}

function combineSnaps(snaps){
    let newSnap = new DownloadSnap()
    snaps.forEach(mySnap => {
        newSnap.add(mySnap.raw, mySnap.cost)
    })
    return newSnap
}

function makeSnapTimelineFromSnaps(snaps){
    let years = {}
    snaps.forEach(snap=>{
        if (years[snap.year]) {
            years[snap.year].add(snap.raw, snap.cost)
        }
        else {
            years[snap.year] = new DownloadSnap(snap.raw, snap.cost)
            years[snap.year].year = snap.year
        }
    })
    let yearsArr = Object.values(years).sort((a, b) => {
        return a.year - b.year
    })
    return yearsArr

}

function addSnaps(a, b){
    let ret = {
        downloads: {},
        price: 0,
        year: null
    }
    Object.keys(a.downloads).forEach(k=>{
        ret.downloads[k] = a.downloads[k] + b.downloads[k]
    })
    ret.price = a.price + b.price
    return ret
}

function combineSnaps(snaps, reduceToOne){
    let years = {}
    snaps.forEach(snap=>{
        if (years[snap.year]) {
            years[snap.year].add(snap.raw, snap.cost)
        }
        else {
            years[snap.year] = new DownloadSnap(snap.raw, snap.cost)
            years[snap.year].year = snap.year
        }
    })
    let yearsArr = Object.values(years).sort((a, b) => {
        return a.year - b.year
    })
    return yearsArr

}



export const store = {
    loading: false,
    loadingState: "ready",
    journalsCount: 0,
    journals: [],
    scenarios: {},
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

    getSelected: function(){
        return this.journals.filter(x =>{
            return x.selected
        })
    },
    getNumPages: function(){
        return Math.ceil(this.journals.length / this.pageSize)
    },

    getNewScenario: function(){
        let selectedSnaps = []
        this.journals.forEach(journal => {
            if (journal.selected){
                selectedSnaps.push(...journal.snaps)
            }
        })

        return makeScenario(selectedSnaps)
    },

    fetchResults: function () {

        this.loadingState = "loading"
        let url = this.getApiUrl()
        console.log("fetching journals from", url)

        // mock out the api response for now, because slow interwebs
        // this.journals = resp.list
        // this.journalsCount = resp.count
        //
        // return




        let request = axios.get(url)
            .then(resp => {
                console.log("got journals back")
                this.journals = resp.data.list.map(journal => {
                    journal.selected = true
                    journal.snaps = makeSnapsFromApi(
                        journal.downloads_by_year,
                        journal.dollars_2018_subscription
                    )

                    journal.scenario = makeScenario(snaps)

                    return journal
                })


                let allSnaps = []
                this.journals.forEach(journal => {
                    allSnaps.push(...journal.timeline)
                })
                this.baselineScenario = makeScenario(allSnaps)


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