import axios from 'axios'
import _ from 'lodash'

import {resp} from "./journalsRespMock.js"

import {subscriptionUseReport, overallUseReport, journalYear} from "./use.js"


// from https://stackoverflow.com/a/7616484/226013
const hashCode = function(str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


export const store = {
    loadingState: "ready",
    journalsCount: 0,
    journals: [],
    baseUrl: "https://rickscafe-api.herokuapp.com/jump/temp",
    page: 1,
    pageSize: 10,

    user: {
        subscriptions: [
            {name: "free", journals: []},
            {name: "fullSubscription", journals: []},
            {name: "docdel", journals: []}
        ],
        subDict: {},
        subHash: 0
    },
    server: {
        journals: []
    },
    computed:{
        journalYears: []
    },
    getApiUrl: function () {
        return this.baseUrl
    },

    getSorted: function () {
        // let fn = function(a, b){
        //     return a.windowTotals.pricePer.requestedItem - b.windowTotals.pricePer.requestedItem
        // }
        // this.journals.sort(fn)

        let startIndex = (this.page - 1) * this.pageSize
        let endIndex = (this.page * this.pageSize) - 1

        return this.journals.slice(startIndex, endIndex)
    },
    getSortedJournalKeys: function () {
        let startIndex = (this.page - 1) * this.pageSize
        let endIndex = (this.page * this.pageSize) - 1

        return this.server.journals
            .slice(startIndex, endIndex)
            .map(journal => journal.meta.issnl)
    },

    getNumPages: function () {
        return Math.ceil(this.server.journals.length / this.pageSize)
    },


    fetchResults: function () {
        this.loadingState = "loading"
        let url = this.getApiUrl()


        let request = axios.get(url)
            .then(resp => {
                console.log("got journals back")

                // latest approach
                this.server.journals = resp.data.list.map(journal => {
                    return {
                        meta: {
                            title: journal.title,
                            subject: journal.subject,
                            issnl: journal.issn_l

                        }
                    }
                })

                resp.data.list.forEach(journal => {
                    this.setSubscription(journal.issn_l, "free")


                })

                resp.data.list.forEach(apiJournal=>{
                    const downloads = apiDownloadsByYear(apiJournal.downloads_by_year)
                    downloads.forEach(myDownloads=>{

                        const myJournalYear = journalYear()
                        myJournalYear.useCount = myDownloads.useCount
                        myJournalYear.oaUseCount = myDownloads.oaUseCount
                        myJournalYear.backCatalogUseCount = myDownloads.backCatalogUseCount
                        myJournalYear.subscriptionPrice = apiJournal.dollars_2018_subscription
                        myJournalYear.issnl = apiJournal.issn_l
                        myJournalYear.subscribedTo = "free"
                        myJournalYear.year = myDownloads.year
                        this.computed.journalYears.push(myJournalYear)
                    })


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
    getUseReport(issnl){
        const myJournalYears = this.computed.journalYears.filter(y=>{
            return y.issnl === issnl
        })
        const yearsWithSubs = myJournalYears.map(journalYear=>{
            const ret = {...journalYear}
            ret.subscribedTo = this.getSubscription(issnl)
            return ret
        })
        return subscriptionUseReport(yearsWithSubs)
    },

    getJournalYear(issnl){

        const myJournalYears = this.computed.journalYears.filter(y=>{
            return y.issnl === issnl
        })
        return myJournalYears.map(journalYear=>{
            const ret = {...journalYear}
            ret.subscribedTo = this.user.subDict[issnl]
            ret._subHash = this.user.subHash
            return ret
        })
    },

    getAllJournalYears(){

        return this.computed.journalYears.map(journalYear=>{
            const ret = {...journalYear}
            ret.subscribedTo = this.getSubscription(journalYear.issnl)
            ret._subHash = this.user.subHash
            return ret
        })
    },


    getJournalMeta(issnl){
        const myJournal = this.server.journals.find(x => x.meta.issnl === issnl)
        return myJournal.meta

    },


    setSubscription: function (issnl, subscriptionName) {

        this.user.subDict[issnl] = subscriptionName
        this.user.subHash = hashCode(JSON.stringify(this.user.subDict))


        // this.user.subscriptions = this.user.subscriptions.map(sub => {
        //     return {
        //         name: sub.name,
        //
        //         // copy and dedup https://stackoverflow.com/a/27664971/226013
        //         journals: [...new Set([].concat(...sub.journals, [issnl]))]
        //
        //         // get rid of this issn in all the other subscription lists
        //             .filter(myIssnl => {
        //                 const removeThis = (myIssnl === issnl && sub.name !== subscriptionName)
        //                 return !removeThis
        //             })
        //     }
        // })
    },
    getSubscription: function (issnl) {
        return this.user.subDict[issnl]



        // const mySubscription = this.user.subscriptions.find(subscription => {
        //     return subscription.journals.includes(issnl)
        // })
        // if (mySubscription) return mySubscription.name
    },



    // utility functions


    nFormat: function (num, hidePercent) {


        if (!num) {
            return 0
        }

        if (hidePercent){
            return num.toFixed(2)
        }

        if (num === 0) {
            return 0
        }

        if (num < 1) {
            return Math.round(100 * num) + "%"
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

function apiDownloadsByYear(apiDownloads) {
    return apiDownloads.year.map((year, i) => {
        return {
            useCount: apiDownloads.total[i],
            oaUseCount: apiDownloads.oa[i],
            backCatalogUseCount: apiDownloads.back_catalog[i],
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