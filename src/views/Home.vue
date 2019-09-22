<template>

    <v-container  fluid class="home pa-0" v-if="api.loadingState==='complete'">
        <div style="position: fixed; top:0; left:0; right:0;background: #fff; z-index:1000;">
            <v-container fluid>
                <v-layout>
                    <v-flex class="fulfillment-graph text-xs-left" xs1>
                        <div style="display: flex; width:100%; height: 100%; min-height: 50px;">
                            <downloads-bar
                                    :snap="overallSnap"
                                    class="pr-1"
                                    style="flex-grow:3;">
                            </downloads-bar>

                            <downloads-bar
                                    v-for="snap in yearlySummarySnaps"
                                    :year="snap.year"
                                    style="flex-grow: 1;"
                                    :snap="snap"></downloads-bar>
                        </div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text-xs-right">
                            <div class="body-1">Instant fulfillments</div>
                            <div class="headline">{{nf(overallSnap.getFulfilledCount(), true)}}</div>
                            <div class="headline">{{nf(percentFulfillmentsChange), true}}%</div>

                        </div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text-xs-right">
                            <div class="body-1">Cost</div>
                            <div class="headline">{{currency(overallSnap.getCost(), true)}}</div>
                            <div class="headline">{{nf(percentCostChange), true}}%</div>

                        </div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text-xs-right">
                            <div class="body-1">Cost per paid usage</div>
                            <div class="headline">{{currency(overallSnap.getCostPerPaidUse())}}</div>
                            <div class="headline">{{currency(pricePerPaidUseChange)}}</div>
                        </div>
                    </v-flex>

                </v-layout>
            </v-container>
        </div>




        <!--- Summary area  -->
        <v-layout row style="padding-top:200px; background: #fff;">
            <v-container fluid>
                <v-layout>
                    <v-flex xs6>
                        <h3 class="display-1">Working scenario </h3>
                        <usage-report style="min-height: 200px;" :yearly-snaps="yearlySummarySnaps" overview="true"></usage-report>
                    </v-flex>

                    <v-flex xs6>
                        <h3 class="display-1">Big Deal scenario </h3>
                        <usage-report style="min-height: 200px;" :yearly-snaps="bigDealYearlySummarySnaps" overview="true"></usage-report>
                    </v-flex>

                </v-layout>
            </v-container>
        </v-layout>


        <!--- working area  -->
        <v-layout class="journal-controls pa-3" style="background: #ccc;">
            <v-flex xs4>
                <v-select
                        :items="journalSortKeys"
                        v-model="selectedJournalSortKey"
                        label="Sort journals by"
                        @change="sort"
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
                                        <v-flex xs3 class="mx-2" style="cursor:pointer;" @click="journal.subscribe(useType.name)">
                                            <span>
                                                <i class="far fa-circle" v-if="!journal.isSubscribedTo(useType.name)"></i>
                                                <i class="fas fa-check-circle" v-if="journal.isSubscribedTo(useType.name)"></i>
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
                                        <v-flex xs3 class="mx-2" style="cursor:pointer;" @click="journal.subscribe('free')">
                                            <span style="cursor:pointer;" @click="journal.subscribe('free')">
                                                <i class="far fa-circle" v-if="!journal.isSubscribedTo('free')"></i>
                                                <i class="fas fa-check-circle" v-if="journal.isSubscribedTo('free')"></i>
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

    import SummarySnap from "../SummarySnap"
    import {currency, nFormat} from "../util";


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
            UsageReport
        },
        data: () => ({
            store: store,
            currentPage: 1,
            pageSize: 30,
            sortBy: "default",
            journalsFromApi: [],
            journals: [],
            bigDealJournals: [],
            api: api,
            bigDealCost: 1000000,
            selectedJournalSortKey: "getBestCostPerPaidUse",
            journalSortKeys: [
                {text: "Best Cost Per Paid Use (CPPA)", value: "getBestCostPerPaidUse"},
                {text: "Total usage (count)", value: "getUseCount"},
                {text: "Hard turnaways (count)", value: "getHardTurnawayCount"},
            ]

        }),
        computed: {
            journalsForPage() {
                let startIndex = (this.currentPage - 1) * this.pageSize
                let endIndex = (this.currentPage * this.pageSize) - 1
                return this.journals.slice(startIndex, endIndex)
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
            percentFulfillmentsChange(){
                return (this.overallSnap.getFulfilledCount() / this.bigDealOverallSnap.getFulfilledCount()) * 100
            },
            percentCostChange(){
                return (this.overallSnap.getCost() / this.bigDealCost) * 100
            },
            pricePerPaidUseChange(){
                const bigDealCostPerPaidUse = this.bigDealCost / this.bigDealOverallSnap.getPaidUsesCount()

                return bigDealCostPerPaidUse

                // return this.bigDealOverallSnap.getCostPerPaidUse() - this.overallSnap.getCostPerPaidUse()
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
                console.log("sorting journals", this.selectedJournalSortKey, sorter)
                this.journals.sort(sorter)
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
