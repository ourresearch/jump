import axios from 'axios'
import _ from 'lodash'

import {resp} from "./journalsRespMock.js"


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
    resultsPerPage: 20,
    baseUrl: "https://rickscafe-api.herokuapp.com/jump/temp",


    // this is for if you are doing filtering on the server, so you are making
    // a new API call to reflect the current state of the search params.
    getApiUrl: function () {
        return this.baseUrl
    },

    reset(){
        this.journals = []
        this.resultsCount = 0
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
                    journal.years = makeYearBins(journal.downloads_by_year)
                    journal.windowTotals = makeWindowTotals(journal.downloads_by_year, journal.dollars_2018_subscription)
                    return journal
                })
                this.resultsCount = resp.data.count

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