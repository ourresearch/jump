import axios from 'axios'


export const api = {
    loadingState: "ready",
    baseUrl: "https://rickscafe-api.herokuapp.com/jump/temp",

    fetchJournals(){
        this.loadingState = "loading"

        const url = this.baseUrl
        let request = axios.get(url)
            .then(resp => {
                console.log("got journals back")
                return resp.data.list.map(journal => {
                    return {
                        meta: {
                            title: journal.title,
                            subject: journal.subject,
                            issnl: journal.issn_l

                        },
                        usageByTypeByYear: apiDownloadsByYear(journal.downloads_by_year),
                        fullSubscriptionPrice: journal.dollars_2018_subscription
                    }
                })
            })
            .catch(e => {
                console.log("journals API error", e)
            })
            .finally(() => {
                this.loadingState = "complete"
            })

        return request
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