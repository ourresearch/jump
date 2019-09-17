import axios from 'axios'
import _ from 'lodash'

import {resp} from "./journalsRespMock.js"





const hardTurnawayProp = 0.1
const docDelPricePerUse = 25


function getModNum(stat, subscription, name, k){
    return makeMods(stat, subscription).filter(x=>x.name === name)[0][k]
}



function makeHypotheticalPaidMods(stat){
    return [
        makeMods(stat, "fullSubscription").find(x=>x.name==="fullSubscription"),
        makeMods(stat, "docdel").find(x=>x.name==="docdel")
    ]
}

function makeMods(stat, subscription){
    let base = {
        name: name,
        price: 0,
        count: 0,
        prop: 0,
        pricePerCount: 0,
        color: "#000",
        isFulfillment: true,
        isEquipped: false,
        isPaid: false
    }

    let freeCount = stat.oaUseCount + stat.backCatalogUseCount
    let unFreeCount = stat.useCount - freeCount
    let hardTurnawayCount =  unFreeCount * hardTurnawayProp

    let makers = {
        oa: function() {
            return Object.assign({}, base, {
                name: "oa",
                count: stat.oaUseCount,
                prop: stat.oaUseCount / stat.useCount,
                color: "#43a047",
                isEquipped: true
            })
        },
        backCatalog: function() {
            return Object.assign({},base, {
                name: "backCatalog",
                count: stat.backCatalogUseCount,
                prop: stat.backCatalogUseCount / stat.useCount,
                color: "#c0ca33",
                isEquipped: true
            })
        },
        fullSubscription: function() {
            let ret = {
                name: "fullSubscription",
                color: "#ef5350",
                isPaid: true
            }
            if (subscription === "fullSubscription") {
                ret = Object.assign({}, ret, {
                    price: stat.subscriptionPrice,
                    count: unFreeCount,
                    prop: unFreeCount / stat.useCount,
                    pricePerCount: stat.subscriptionPrice / unFreeCount,
                    isEquipped: true
                })
            }
            return Object.assign({}, base, ret)
        },
        docdel: function() {
            let ret = {
                name: "docdel",
                color: "#ff7043",
                isPaid: true
            }
            if (subscription === "docdel") {
                ret = Object.assign({}, ret, {
                    price: hardTurnawayCount * docDelPricePerUse,
                    count: hardTurnawayCount,
                    prop: hardTurnawayCount / stat.useCount,
                    pricePerCount: docDelPricePerUse,
                    isEquipped: true
                })
            }
            return Object.assign({}, base, ret)
        },
        hardTurnaway: function() {
            let ret = {
                name: "hardTurnaway",
                color: "#555",
                isFulfillment: false
            }

            // docdel wipes out all hard turnaways
            // fullsubscription does too
            if (subscription === "free") {
                ret = Object.assign({}, ret, {
                    count: hardTurnawayCount,
                    prop: hardTurnawayCount / stat.useCount,
                })
            }
            return Object.assign({}, base, ret)
        },
        softTurnaway: function() {
            let ret = {
                name: "softTurnaway",
                color: "#999",
                isFulfillment: false
            }

            // full subscription wipes out all soft turnaways
            if (subscription !== "fullSubscription") {
                ret = Object.assign({}, ret, {
                    count: (1 - hardTurnawayProp) * unFreeCount,
                    prop: ((1 - hardTurnawayProp) * unFreeCount) / stat.useCount,
                })
            }
            return Object.assign({}, base, ret)
        },
    };


    return Object.values(makers).map(x => x())
    //
    // let ret = {}
    // Object.keys(makers).map(k=>{
    //     ret[k] = makers[k]()
    // })
    // return ret
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

    // selectMods: selectMods,
    makeMods: makeMods,
    getModNum: getModNum,
    makeHypotheticalPaidMods: makeHypotheticalPaidMods,

    fetchResults: function () {

        this.loadingState = "loading"
        let url = this.getApiUrl()
        console.log("fetching journals from", url)

        let request = axios.get(url)
            .then(resp => {
                console.log("got journals back")

                this.journals = resp.data.list.map(journal => {
                    journal.statsByYear = statsByYear(
                        journal.downloads_by_year,
                        journal.dollars_2018_subscription
                    )
                    return journal
                })

                // this.journalsOrig = JSON.parse(JSON.stringify(this.journals))
            })
            .catch(e => {
                console.log("journals API error", e)
            })
            .finally(() => {
                this.loadingState = "complete"
            })
        return request
    },

    getHardTurnaways(stat, subscription){

    },






    // utility functions

    sumObjects: function(a, b){
        let ret = {}
        Object.keys(a).forEach(k => {
            ret[k] = a[k] + b[k]
        })
        return ret
    },

    nFormat: function(num, hidePercent) {

        if (!num){
            return 0
        }

        if (num === 0){
            return 0
        }

        if (num < 1) {
            if (hidePercent){
                return num.toFixed(2)
            }
            else {
                return Math.round(100*num) + "%"
            }
        }


        // from http://stackoverflow.com/a/14994860/226013
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return num;
    }



}




function statsByYear(apiDownloads, price){
    return apiDownloads.year.map((year, i)=> {
        return {
            useCount: apiDownloads.total[i],
            oaUseCount: apiDownloads.oa[i],
            backCatalogUseCount: apiDownloads.back_catalog[i],
            subscriptionPrice: price,
            year: year
        }
    })
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