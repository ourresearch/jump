import axios from 'axios'
import _ from 'lodash'

import {resp} from "./journalsRespMock.js"

import {subscriptionUseReport} from "./use.js"



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
        ]
    },
    server: {
        journals: []
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
                resp.data.list.forEach(journal => {
                    this.setSubscription(journal.issn_l, "free")
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
        const myJournal = this.server.journals.find(x => x.meta.issnl === issnl)
        return subscriptionUseReport(
            myJournal.statsByYear,
            this.getSubscription(issnl)
        )
    },

    getJournalMeta(issnl){
        const myJournal = this.server.journals.find(x => x.meta.issnl === issnl)
        return myJournal.meta

    },


    getJournals: function () {
        return this.input.journals.map(j => this.makeJournalFromInput(
            j.server,
            this.getSubscription(j.issnl)
        ))
    },

    setSubscription: function (issnl, subscriptionName) {
        this.user.subscriptions = this.user.subscriptions.map(sub => {
            return {
                name: sub.name,

                // copy and dedup https://stackoverflow.com/a/27664971/226013
                journals: [...new Set([].concat(...sub.journals, [issnl]))]

                // get rid of this issn in all the other subscription lists
                    .filter(myIssnl => {
                        const removeThis = (myIssnl === issnl && sub.name !== subscriptionName)
                        return !removeThis
                    })
            }
        })
    },
    getSubscription: function (issnl) {

        const mySubscription = this.user.subscriptions.find(subscription => {
            return subscription.journals.includes(issnl)
        })
        if (mySubscription) return mySubscription.name
    },



    // utility functions


    nFormat: function (num, hidePercent) {

        if (!num) {
            return 0
        }

        if (num === 0) {
            return 0
        }

        if (num < 1) {
            if (hidePercent) {
                return num.toFixed(2)
            } else {
                return Math.round(100 * num) + "%"
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


function statsByYear(apiDownloads, price) {
    return apiDownloads.year.map((year, i) => {
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