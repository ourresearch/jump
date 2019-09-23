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
        <v-layout class="journal-controls pa-3" style="background: #ccc;">
            <v-flex xs4>
                <v-select
                        :items="journalSortKeys"
                        v-model="selectedJournalSortKey"
                        label="Sort journals by"
                        outline
                ></v-select>

            </v-flex>

        </v-layout>


        <v-layout>



            <!--- journals list  -->
            <v-flex md12>
                <v-layout>
                    sorting by price per requested item.
                </v-layout>

                <v-layout column>

                    <!-- journal row -->
                    <v-flex class="journal-row py-3" v-for="journal in journalsForPage">
                        <v-layout align-items-top>
                            <v-flex shrink>
                                <v-checkbox class="pa-0 mt-1"></v-checkbox>
                            </v-flex>

                            <v-flex grow>

                                <!-- journal META section -->
                                <v-layout>
                                    <v-flex>
                                        <div>
                                            <div class="name headline">
                                                {{journal.meta.title}}
                                            </div>
                                            <div class="topic body-1">
                                                {{journal.meta.issnl}}
                                                {{ journal.meta.subject}}
                                            </div>
                                            <div>best cppu: {{journal.getBestCostPerPaidUse()}}</div>

                                        </div>
                                    </v-flex>
                                </v-layout>

                                <!-- journal USAGE section -->
                                <v-layout>
                                    <v-flex xs6>
                                        <usage-report :yearly-snaps="journal.getSubscriptionSnaps()"></usage-report>

                                    </v-flex>
                                </v-layout>




                                <!-- journal SUBSCRIPTION section -->
                                <div class="pa-2 mt-2">
                                    <v-layout>
                                        <h3 class="subheading">Subscriptions</h3>
                                    </v-layout>
                                    <v-layout v-for="useType in journal.getHypotheticalSubscriptionMods()">
                                        <v-flex xs3 class="mx-2" style="cursor:pointer;" @click="subscribe(journal.meta.issnl, useType.name)">
                                            <span>
                                                <i class="far fa-circle" v-if="!hasSubscription(journal.meta.issnl, useType.name)"></i>
                                                <i class="fas fa-check-circle" v-if="hasSubscription(journal.meta.issnl, useType.name)"></i>
                                            </span>

                                            {{useType.name}}
                                        </v-flex>
                                        <v-flex xs1 class="mx-2">
                                            {{nf(useType.count)}}
                                        </v-flex>
                                        <v-flex xs1 v-if="useType.cost" class="mx-2">
                                            {{currency(useType.cost, true)}}
                                        </v-flex>
                                        <v-flex xs1 v-if="useType.costPerCount" class="px-2">
                                            {{currency(useType.costPerCount)}}
                                        </v-flex>
                                    </v-layout>
                                    <v-layout>
                                        <v-flex xs3 class="mx-2" style="cursor:pointer;" @click="subscribe(journal.meta.issnl, 'free')">
                                            <span style="cursor:pointer;" @click="subscribe('free')">
                                                <i class="far fa-circle" v-if="!hasSubscription(journal.meta.issnl, 'free')"></i>
                                                <i class="fas fa-check-circle" v-if="hasSubscription(journal.meta.issnl, 'free')"></i>
                                            </span>
                                            Free
                                        </v-flex>
                                    </v-layout>

                                </div>

                            </v-flex>

                        </v-layout>


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
    import ScenarioComparison from "../components/ScenarioComparison"

    import SummarySnap from "../SummarySnap"
    import {currency, nFormat} from "../util";
    import {makeScenarioComparison} from "../scenario";


    const makeYearlySummarySnaps = function(journalList){
            const years = ["2020", "2021", "2022", "2023", "2024"]
            const ret = {}
            years.forEach(y => ret[y] = new SummarySnap())

            journalList.forEach(journal => {
                journal.getSubscriptionSnaps().forEach(snap => {
                    ret[snap.year].addSnap(snap)
                })
            })
            return Object.values(ret)
    }



    export default {
        name: 'Home',
        components: {
            DownloadsBar,
            UsageReport,
            ScenarioComparison
        },
        data: () => ({
            store: store,
            currentPage: 1,
            pageSize: 3,
            sortBy: "default",
            journalsFromApi: [],
            journals: [],
            bigDealJournals: [],
            api: api,
            isLoading: false,
            bigDealCost: 1000000,
            selectedJournalSortKey: "getBestCostPerPaidUse",
            journalSortKeys: [
                {text: "Best Cost Per Paid Use (CPPA)", value: "getBestCostPerPaidUse"},
                {text: "Total usage (count)", value: "getUseCount"},
                {text: "Hard turnaways (count)", value: "getHardTurnawayCount"},
            ],
            subscriptions: {},
            scenarioComparison: {}

        }),
        computed: {
            journalsForPage() {
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
            subscribe(issnl, newSubscriptionName){
                console.log("subscribe!", newSubscriptionName)
                this.isLoading = true;
                this.subscriptions[issnl] = newSubscriptionName

                let that = this
                // setTimeout(function(){
                //     that.isLoading = false
                //     console.log("no more loading...")
                // },1000)
                setTimeout(function(){
                    that.setJournals()

                })

            }
        },
        mounted() {
            api.fetchJournals()
                .then(resp => {
                    this.journalsFromApi = resp
                    this.journals = resp.map(x => {
                        let myJournal = new Journal(x, "free")
                        return myJournal

                    })
                    this.bigDealJournals = resp.map(x => {
                        let myJournal = new Journal(x, "fullSubscription")
                        return myJournal

                    })

                    this.sort()
                })
        },
        watch: {
        }

    }
</script>


<style scoped lang="scss">


</style>
