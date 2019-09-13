import axios from 'axios'
import _ from 'lodash'

import {resp} from "./journalsRespMock.js"








class DownloadSnap{
    constructor(downloads, cost){
        this.outcomes = [
            "backCatalog",
            "oa",
            "turnaway"
        ]
        this.cost = 0
        this.raw = {}
        this.outcomes.forEach(x => {
            this.raw[x] = 0
        })


        this.prop = {}
        this.pricePer = {}

        this.add(downloads, cost)
    }
    toDict(){
        return {
            year: this.year,
            total: this.total,
            cost: this.cost,
            raw: this.raw,
            prop: this.prop,
            pricePer: this.pricePer
        }
    }

    add(downloads, cost){
        this.cost += cost

        this.outcomes.forEach(x => {
            this.raw[x] += downloads[x]
        })
        this.total = this.raw.backCatalog + this.raw.oa + this.raw.turnaway

        this.outcomes.forEach(x => {
            this.prop[x] = this.raw[x] / this.total
        })

        this.pricePer = {
            download: this.total / cost,
            turnaway: this.raw.turnaway / cost,
            adjTurnaway: this.raw.turnaway * .1 / cost
        }
    }
}

function addDownloadSnaps(a, b){
    if (!b) {
        return a
    }
    a.add(b.raw, b.cost)
    return a
}



function makeSnapTimelineFromApi(apiTimeline, price){
    let ret = []
    apiTimeline.year.forEach((year, i) => {

        let downloads = {
            backCatalog: apiTimeline.back_catalog[i],
            oa: apiTimeline.oa[i],
            turnaway: apiTimeline.turnaways[i]
        }
        let mySnap = new DownloadSnap(downloads, price)
        mySnap.year = year
        ret.push(mySnap)
    })
    return ret

}





function makeYearBins(downloadsByYear){
    const years = [0,1,2,3,4]
    const metrics = [
        "back_catalog",
        "oa",
        "turnaways"
    ]
    let ret = []
    years.forEach(i => {
        let year = {
            year: downloads_by_year.year[i],
            raw: {
                backCatalog: downloadsByYear["back_catalog"][i],
                oa: downloadsByYear["oa"][i],
                turnaways: downloadsByYear["turnaways"][i],
                total: downloadsByYear["total"][i],
            },
            prop: {}
        }
        year.prop.backCatalog =  year.raw.backCatalog / year.raw.total
        year.prop.oa =  year.raw.oa / year.raw.total
        year.prop.turnaways =  year.raw.turnaways / year.raw.total
        ret.push(year)
    })
    return ret
}

function makeWindowTotals(downloadsByYear, price){
    const years = [0,2,3,4,5]
    const add = (a, b) => a + b;
    let ret1 = {
        backCatalog: 0,
        oa: 0,
        turnaways: 0,
        total: 0,
        price: 0
    }

    let ret = {
        raw: {
            backCatalog: downloadsByYear.back_catalog.reduce(add),
            oa: downloadsByYear.oa.reduce(add),
            turnaways: downloadsByYear.turnaways.reduce(add),
            total: downloadsByYear.total.reduce(add),
            price: price * years.length
        },
        prop: {},
        pricePer: {},

    }
    ret.prop.backCatalog = ret.raw.backCatalog / ret.raw.total
    ret.prop.oa = ret.raw.oa / ret.raw.total
    ret.prop.turnaways = ret.raw.turnaways / ret.raw.total

    ret.pricePer.download =  ret.raw.price / ret.raw.total
    ret.pricePer.turnaways =  ret.raw.price / ret.raw.turnaways
    ret.pricePer.requestedItem = ret.raw.price / (ret.raw.turnaways * .1)

    ret.priceWithDocdel = (ret.raw.turnaways * .1 * 25) / 5

    return ret
}



export const store = {
    loading: false,
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

    getSelected: function(){
        return this.journals.filter(x =>{
            return x.selected
        })
    },
    getNumPages: function(){
        return Math.ceil(this.journals.length / this.pageSize)
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
                    journal.timeline = makeSnapTimelineFromApi(journal.downloads_by_year, journal.dollars_2018_subscription)
                    // journal.windowTotals = makeWindowTotals(journal.downloads_by_year, journal.dollars_2018_subscription)
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