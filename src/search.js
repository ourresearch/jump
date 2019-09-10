import axios from 'axios'
import _ from 'lodash'

import {resp} from "./journalsRespMock.js"


console.log("this is the journals response mock", resp)

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
                this.journals = resp.data.list
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