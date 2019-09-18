import axios from 'axios'
import _ from 'lodash'

import {resp} from "./journalsRespMock.js"





const hardTurnawayProp = 0.1
const docDelPricePerUse = 25


function getModNum(stat, subscription, name, k){
    return makeMods(stat, subscription).filter(x=>x.name === name)[0][k]
}

const sumObjects =  function(a, b){
    let ret = {}
    Object.keys(a).forEach(k => {
        ret[k] = a[k] + b[k]
    })
    return ret
}


function makeHypotheticalPaidMods(stat){
    return [
        makeMods(stat, "fullSubscription").find(x=>x.name==="fullSubscription"),
        makeMods(stat, "docdel").find(x=>x.name==="docdel")
    ]
}
function makePotentialUses(stat, subscriptionName){
    return ["fullSubscription", "docdel"]
        .filter(x=>x !== subscriptionName)
        .map(potentialSubscriptionName=>{
            // make full of this type
            return makeMods(stat, potentialSubscriptionName)
                .find(mod => {
                    // only return the subscription use, not all of them.
                    return mod.name === potentialSubscriptionName
                })
        })


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







const fulfilledUses = function(oa, backCatalog, total, subscription){

}




export const store = {
    loadingState: "ready",
    journalsCount: 0,
    journals: [],
    baseUrl: "https://rickscafe-api.herokuapp.com/jump/temp",
    page: 1,
    pageSize: 10,

    bar: [],

    foo: {
        journals: {
        }
    },

    input: {
        journals: []
    },

    user: {
        journals: {foo: 42},
        subscriptions: [
            {name: "free", journals:[]},
            {name: "fullSubscription", journals:[]},
            {name: "docdel", journals:[]}
        ]
    },
    server: {
        journals: []
    },


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
    getSortedJournalKeys: function(){
        let startIndex = (this.page - 1) * this.pageSize
        let endIndex = (this.page * this.pageSize) - 1

        return this.server.journals
            .slice(startIndex, endIndex)
            .map(journal => journal.meta.issnl)
    },

    getNumPages: function(){
        return Math.ceil(this.server.journals.length / this.pageSize)
    },

    // selectMods: selectMods,
    makeMods: makeMods,
    getModNum: getModNum,
    makeHypotheticalPaidMods: makeHypotheticalPaidMods,

    fetchResults: function () {
        this.loadingState = "loading"
        let url = this.getApiUrl()



        let request = axios.get(url)
            .then(resp => {
                console.log("got journals back")

                // latest approach
                this.server.journals = resp.data.list.map(journal => {
                    return {
                        statsByYear: statsByYear(
                            journal.downloads_by_year,
                            journal.dollars_2018_subscription
                        ),
                        meta: {
                            title: journal.title,
                            subject: journal.subject,
                            issnl: journal.issn_l

                        }
                    }
                })
                resp.data.list.forEach(journal=>{
                    this.setSubscription(journal.issn_l, "free")
                })

                // this.setSubscription("0092-8674", "free")




                // this.addFreeArr(1)
                // this.addFreeArr(2)



            })
            .catch(e => {
                console.log("journals API error", e)
            })
            .finally(() => {
                this.loadingState = "complete"
            })
        return request
    },

    getJournal(issnl){
        return this.makeJournalFromInput(
            this.server.journals.find(x=>x.meta.issnl===issnl),
            this.getSubscription(issnl)
        )

    },

    addFreeArr: function(x){
        this.user.free = [...this.user.free, x]
    },

    getJournals: function(){
        return this.input.journals.map(j=> this.makeJournalFromInput(
            j.server,
            this.getSubscription(j.issnl)
        ))
    },

    setSubscription: function(issnl, subscriptionName){
        this.user.subscriptions = this.user.subscriptions.map(sub => {
            return {
                name: sub.name,

                // copy and dedup https://stackoverflow.com/a/27664971/226013
                journals: [...new Set([].concat(...sub.journals, [issnl]))]

                    // get rid of this issn in all the other subscription lists
                    .filter(myIssnl => {
                        const removeThis = (myIssnl===issnl && sub.name !== subscriptionName)
                        return !removeThis
                    })
            }
        })
    },
    getSubscription: function(issnl){

        const mySubscription = this.user.subscriptions.find(subscription=> {
            return subscription.journals.includes(issnl)
        })
        if (mySubscription) return mySubscription.name
    },

    makeJournalFromInput: (server, subscriptionName) => {

        const overallUses = makeMods(
            server.statsByYear.reduce(sumObjects),
            subscriptionName
        )
        const yearlyUses = server.statsByYear.map(year=> {
            return {
                year: year.year,
                uses: makeMods(year, subscriptionName)
            }
        })
        const fulfilledCost = overallUses
            .filter(x=>x.isFulfillment)
            .map(x=>x.price)
            .reduce((a,b)=>a+b)

        const paidUsesCount = overallUses
                .filter(x=>x.price > 0)
                .map(x=>x.count)
                .reduce((a,b)=>a+b, 0)

        return {
            ...
            {
                meta: server.meta,
                uses: overallUses,
                yearlyUses: yearlyUses,
                potentialUses: makePotentialUses(
                    server.statsByYear.reduce(sumObjects),
                    subscriptionName
                ),
                fulfilledCount: overallUses
                    .filter(x=>x.isFulfillment)
                    .map(x=>x.count)
                    .reduce((a,b)=>a+b),
                fulfilledCost: fulfilledCost,
                pricePerPaidUse: fulfilledCost / paidUsesCount,
                getUse: name => {
                    return overallUses.find(x=>x.name===name)
                }
            },

        }

    },






    // utility functions



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