<template>

    <v-container  fluid class="home pa-0" v-if="api.loadingState==='complete'">
        <div class="loading"  style="position: fixed; top:0; left:0; right:0;background: orangered; z-index:10000;" v-if="isLoading">loading</div>




        <scenario-comparison
                :yearly-summary-snaps="yearlySummarySnaps"
                :overall-snap="overallSnap"
                :big-deal-yearly-summary-snaps="bigDealYearlySummarySnaps"
                :big-deal-overall-snap="bigDealOverallSnap"
        ></scenario-comparison>





        <!--- working area  -->
        <!--- sort controls  -->
        <v-layout class="journal-controls pa-3" style="background: #ccc;">
            <v-flex xs4>
                <v-select
                        :items="journalSortKeys"
                        v-model="selectedJournalSortKey"
                        label="Sort journals by"
                        @change="printJournalsDict"
                        outline
                ></v-select>
            </v-flex>
        </v-layout>


        <!--- journals list  -->
        <v-layout>
            <v-flex md12>
                <v-layout column class="journals-list">
                    <v-flex v-for="journalData in journalsToPrint">
                        <journal-row @subscribe="subscribe" :data="journalData"></journal-row>
                    </v-flex>
                </v-layout>
                <v-layout>
                    <v-pagination
                            class="ma-4"
                            v-model="currentPage"
                            :length="Math.ceil(journalsFromApi.length / pageSize)"
                            :total-visible="20"
                    ></v-pagination>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-container>
</template>


<script>
    import {store} from "../search.js"
    import {api} from "../api.js"

    import DownloadsBar from "../components/DownloadsBar"
    import UsageReport from "../components/UsageReport"
    import Journal from "../journal.js"
    import JournalRow from "../components/JournalRow"
    import ScenarioComparison from "../components/ScenarioComparison"

    import SummarySnap from "../SummarySnap"
    import {currency, nFormat} from "../util";
    import {makeJournal} from "../subscription";
    import {makeScenarioComparison} from "../scenario";


    const makeYearlySummarySnaps = function(journalList){
        const years = ["2020", "2021", "2022", "2023", "2024"]
        const ret = {}

        years.forEach(y=>ret[y] = [])

        journalList.forEach(journal => {
            journal.getSubscriptionSnaps().forEach(snap => {
                ret[snap.year].push(snap)
            })
        })

        return Object.entries(ret).forEach((k, v)=>{
            ret[k] = new SummarySnap(v)
            ret[k].year = k
        })

    }



    export default {
        name: 'Home',
        components: {
            DownloadsBar,
            UsageReport,
            ScenarioComparison,
            JournalRow
        },
        data: () => ({
            store: store,
            currentPage: 1,
            pageSize: 20,
            sortBy: "default",
            journalsFromApi: [],
            journals: [],
            bigDealJournals: [],
            api: api,
            isLoading: false,
            bigDealCost: 1000000,
            selectedJournalSortKey: "getUseCount",
            journalSortKeys: [
                {text: "Best Cost Per Paid Use", value: "bestCostPerPaidUse"},
                {text: "Total usage", value: "getUseCount"},
                {text: "Hard turnaways", value: "hardTurnawayCount"},
            ],
            journalsDict:{},
            journalsToPrint: [],
            apiJournals: {}

        }),
        computed: {
            journalsForPage() {
                return []
                const ret = [...this.journals]
                    const sorter = (a,b) => {
                        const fnName = this.selectedJournalSortKey
                        let ret = b[fnName]() - a[fnName]()
                        if (fnName==='getBestCostPerPaidUse'){
                            ret = -ret
                    }
                    return ret
                }
                ret.sort(sorter)

                let startIndex = (this.currentPage - 1) * this.pageSize
                let endIndex = (this.currentPage * this.pageSize) - 1
                return ret.slice(startIndex, endIndex)
            },

            yearlySummarySnaps() {
                return makeYearlySummarySnaps(this.journals)
            },

            bigDealYearlySummarySnaps(){
                return makeYearlySummarySnaps(this.bigDealJournals)
            },

            bigDealOverallSnap(){
                return new SummarySnap(this.bigDealYearlySummarySnaps)
            },

            overallSnap(){
                return new SummarySnap(this.yearlySummarySnaps)
            },

            pageStartIndex(){
                return (this.currentPage - 1) * this.pageSize
            },
            pageEndIndex(){
                return (this.currentPage * this.pageSize) - 1
            }


        },
        methods: {
            nf: nFormat,
            currency: currency,
            sort: function(){
                const sorter = (a,b) => {
                    const fnName = this.selectedJournalSortKey
                    let ret = b[fnName]() - a[fnName]()
                    if (fnName==='getBestCostPerPaidUse'){
                        ret = -ret
                    }
                    return ret

                }
                this.journals.sort(sorter)
            },
            getSubscription(issnl){
                if (this.subscriptions[issnl]) return  this.subscriptions[issnl]
                return "free"
            },
            hasSubscription(issnl, nameToCheck){
                const issnlSubscription = this.getSubscription(issnl)

                return issnlSubscription === nameToCheck
            },
            setJournals(){
                this.journals = this.journalsFromApi.map(x => {
                        let myJournal = new Journal(x, this.getSubscription(x.meta.issnl))
                        return myJournal

                    })
                this.isLoading = false
            },
            subscribe(args){
                console.log("subscribe!", args.issnl, args.subscriptionName)
                const myApiData = this.apiJournals[args.issnl]
                this.journalsDict[args.issnl] = makeJournal(
                    myApiData,
                    args.subscriptionName
                )

                this.printJournalsDict()



                // this.isLoading = true;
                // this.subscriptions[issnl] = newSubscriptionName
                //
                // let that = this
                // // setTimeout(function(){
                // //     that.isLoading = false
                // //     console.log("no more loading...")
                // // },1000)
                // setTimeout(function(){
                //     that.setJournals()
                //
                // })

            },
            printJournalsDict(){
                console.log("printing journals dict!")
                const sortKey = this.selectedJournalSortKey
                const sortFn = function(a,b){
                    let ret = b.sortKeys[sortKey] - a.sortKeys[sortKey]
                    if (sortKey==='bestCostPerPaidUse'){
                        ret = -ret
                    }
                    return ret
                }

                this.journalsToPrint = Object.values(this.journalsDict)
                    .sort(sortFn)
                    .slice(this.pageStartIndex, this.pageEndIndex)
            }
        },
        mounted() {
            api.fetchJournals()
                .then(resp => {
                    resp.forEach(apiJournalData=>{
                        const myIssnl = apiJournalData.meta.issnl

                        this.apiJournals[myIssnl] = apiJournalData
                        this.journalsDict[myIssnl] = makeJournal(
                            apiJournalData,
                            "fullSubscription"
                        )
                    })

                    this.printJournalsDict()



                    // this.journalsFromApi = resp
                    // this.journals = resp.map(x => {
                    //     let myJournal = new Journal(x, "free")
                    //     return myJournal
                    //
                    // })
                    // this.bigDealJournals = resp.map(x => {
                    //     let myJournal = new Journal(x, "fullSubscription")
                    //     return myJournal
                    //
                    // })
                    //
                    // this.sort()
                })
        },
        watch: {
        }

    }
</script>


<style scoped lang="scss">


</style>
