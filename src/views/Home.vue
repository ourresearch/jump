<template>

    <v-container fluid class="home pa-0" v-if="api.loadingState==='complete'">
        <div class="loading" style="position: fixed; top:0; left:0; right:0;background: orangered; z-index:10000;"
             v-if="isLoading">loading
        </div>


        <scenario-comparison
                :data="scenarioComparison"
        ></scenario-comparison>






        <!-- fixed-position header area -->
        <div class="fixed-header-wrapper">
            <div class="fixed-header">

                <v-container fluid v-if="newScenario.subscriptions">
                    <v-layout>
                        <v-flex class="fulfillment-graph" shrink>
                            <downloads-chart
                                    :yearly-subscriptions="newScenario.subscriptions.byYear">
                            </downloads-chart>

                        </v-flex>
                        <v-flex xs3>
                            <div class="text-xs-right">
                                <div class="body-1">Instant fulfillments</div>
                                <div class="headline">
                                    {{nf(newScenario.subscriptions.overall.getFulfilledUsesCount())}}
                                </div>
                                <!--                            <div class="headline">{{nf(percentFulfillmentsChange), true}}%</div>-->

                            </div>
                        </v-flex>
                        <v-flex xs3>
                            <div class="text-xs-right">
                                <div class="body-1">Cost</div>
                                <div class="headline">{{currency(newScenario.subscriptions.overall.cost, true)}}</div>
                                <!--                            <div class="headline">{{// nf(percentCostChange), true}}%</div>-->

                            </div>
                        </v-flex>
                        <v-flex xs3>
                            <div class="text-xs-right">
                                <div class="body-1">Cost per paid usage</div>
                                <div class="headline">
                                    {{currency(newScenario.subscriptions.overall.costPerPaidUse())}}
                                </div>
                                <!--                            <div class="headline">{{currency(pricePerPaidUseChange)}}</div>-->
                            </div>
                        </v-flex>

                    </v-layout>
                </v-container>


                <!-- toolbar for sort and subscribe -->
                <v-toolbar align-center class="toolbar pa-3" style="background: #ccc;">
                    <v-flex shrink>
                        <v-btn icon @click="selectAll" v-if="isNoneSelected">
                            <v-icon>check_box_outline_blank</v-icon>
                        </v-btn>
                        <v-btn icon @click="unselectAll" v-if="isAllSelected">
                            <v-icon>check_box</v-icon>
                        </v-btn>
                        <v-btn icon @click="unselectAll" v-if="isPartSelected">
                            <v-icon>indeterminate_check_box</v-icon>
                        </v-btn>
                        <span class="num" style="min-width: 2em; display:inline-block;text-align:right;">
                            {{this.selectedJournals.length}}
                        </span>
                         selected
                    </v-flex>
                    <v-flex shrink v-if="this.selectedJournals.length">
                        <v-menu offset-y>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                        flat
                                        outline
                                        v-on="on"
                                >
                                    Change subscription
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-tile
                                        v-for="(subscriptionName, index) in subscriptionNames"
                                        :key="index"
                                        @click="subscribeSelected(subscriptionName)"
                                >
                                    <v-list-tile-title>{{ subscriptionName }}</v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </v-flex>


                    <v-flex grow></v-flex>

                    <v-flex shrink class="paging">
                        <v-layout align-center>
                            <v-flex class="number">
                                {{pageStartIndex + 1}}-{{pageEndIndex}}
                                of {{journalsList.length}}
                            </v-flex>
                            <v-flex class="pr-4 pl-2">
                                <v-layout>
                                    <v-flex>
                                        <v-btn @click="currentPage-=1" :disabled="isOnFirstPage" flat icon class="ma-0">
                                            <i class="fas fa-angle-left"></i>
                                        </v-btn>
                                    </v-flex>
                                    <v-flex>
                                        <v-btn @click="currentPage+=1" :disabled="isOnLastPage" flat icon class="ma-0">
                                            <i class="fas fa-angle-right"></i>
                                        </v-btn>

                                    </v-flex>
                                </v-layout>
                            </v-flex>

                        </v-layout>
                    </v-flex>
                    <v-flex shrink xs2>
                        <v-select
                                :items="journalSortKeys"
                                v-model="selectedJournalSortKey"
                                label="Sort by"
                                @change="manualSort"
                                outline
                        ></v-select>
                    </v-flex>
                </v-toolbar>
            </div>
        </div>




        <!--- journals list  -->
        <v-layout column>
            <v-flex grow v-for="journalData in journalsPage" class="ma-3">
                <v-layout>
                    <v-flex shrink>
                        <v-checkbox
                                v-model="journalData.isSelected"
                                class="pa-0 mt-1"></v-checkbox>
                    </v-flex>
                    <v-flex grow>
                        <journal-row @subscribe="subscribe" :data="journalData"></journal-row>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-container>
</template>


<script>
    import {api} from "../api.js"

    import DownloadsChart from "../components/DownloadsChart"
    import JournalRow from "../components/JournalRow"
    import ScenarioComparison from "../components/ScenarioComparison"

    import {currency, nFormat} from "../util";
    import {Journal} from "../Journal.js";
    import {makeScenario, makeScenarioComparison} from "../scenario";


    export default {
        name: 'Home',
        components: {
            DownloadsChart,
            ScenarioComparison,
            JournalRow
        },
        data: () => ({
            currentPage: 1,
            pageSize: 50,
            sortBy: "default",
            api: api,
            isLoading: false,
            selectedJournalSortKey: "totalUsage",
            journalSortKeys: [
                {text: "Best Cost Per Paid Use", value: "bestCostPerPaidUse"},
                {text: "Total usage", value: "totalUsage"},
                {text: "Hard turnaways", value: "hardTurnawayCount"},
                {text: "Title", value: "title"},
            ],
            descendingSorts: [
                "totalUsage",
                "hardTurnawayCount",
            ],
            journalsList: [],
            bigDealCost: 1000000,
            scenarioComparison: {},
            oldScenario: {},
            newScenario: {},
            subscriptionNames: [
                "fullSubscription",
                "docdel",
                "ill",
                "free"
            ],

        }),
        computed: {

            pageStartIndex() {
                return (this.currentPage - 1) * this.pageSize
            },
            pageEndIndex() {
                return (this.currentPage * this.pageSize)
            },
            isOnFirstPage(){
                return this.currentPage <= 1
            },
            isOnLastPage(){
                const numPages = Math.ceil(this.journalsList.length / this.pageSize)
                return this.currentPage >= numPages
            },


            journalsPage(){
                return this.journalsList
                    .slice(this.pageStartIndex, this.pageEndIndex)
            },
            selectedJournals(){
                return this.journalsList.filter(j=>j.isSelected)
            },
            isAllSelected(){
                return this.journalsList.length === this.selectedJournals.length
            },
            isPartSelected(){
                return !this.isAllSelected && this.selectedJournals.length
            },
            isNoneSelected(){
                return this.selectedJournals.length === 0
            }



        },
        methods: {
            nf: nFormat,
            currency: currency,

            // selection stuff
            // *****************
            selectAll() {
                console.log("select all")
                this.journalsList.forEach(j=>{
                    j.isSelected = true
                })

            },
            unselectAll() {
                console.log("unselect all")
                this.journalsList.forEach(j=>{
                    j.isSelected = false
                })

            },


            subscribeSelected(newSubscriptionName) {
                console.log("subscribe selected", newSubscriptionName)
                this.selectedJournals.forEach(j=>{
                    j.subscribe(newSubscriptionName)
                })
                this.sortJournalsList()
                this.printScenarioComparison()
            },


            getSubscription(issnl) {
                if (this.subscriptions[issnl]) return this.subscriptions[issnl]
                return "free"
            },

            printScenarioComparison() {
                this.newScenario = makeScenario(this.journalsList, 0)
                this.scenarioComparison = makeScenarioComparison(
                    this.newScenario,
                    this.oldScenario
                )
            },

            subscribe(args) {
                console.log("subscribe!", args.issnl, args.subscriptionName)
                const myIssnl = args.issnl
                const mySubscriptionName = args.subscriptionName

                this.journalsList.find(j=>{
                    return j.meta.issnl === myIssnl
                }).subscribe(mySubscriptionName)

                this.sortJournalsList()
                this.printScenarioComparison()


            },
            manualSort(){
                this.sortJournalsList()
                this.currentPage = 1
            },
            sortJournalsList(){
                const sortKey = this.selectedJournalSortKey
                const desc = this.descendingSorts.includes(sortKey)
                const sortFn = function (a, b) {
                    let ret = 0
                    if (a.sortKeys[sortKey] < b.sortKeys[sortKey]) {
                        ret = -1
                    } else {
                        ret = 1
                    }
                    if (desc) ret = -ret

                    return ret
                }
                this.journalsList = this.journalsList.sort(sortFn)
                console.log("sort done", this.journalsList[0].meta.title, this.journalsList[0].sortKeys)

            },
        },
        mounted() {
            let maxJournalsToFetch
            console.log("mounted")
            // maxJournalsToFetch = 10  // for testing
            api.fetchJournals()
                .then(resp => {
                    console.log("got journals back")
                    resp.forEach((apiJournalData, index) => {
                        if (index >= maxJournalsToFetch) return true

                        const myIssnl = apiJournalData.meta.issnl
                        this.journalsList.push(new Journal(
                            apiJournalData,
                            "fullSubscription"
                        ))
                    })


                    console.log("printing scenario stuff")
                    this.oldScenario = makeScenario(
                       this.journalsList,
                        this.bigDealCost
                    )

                    this.printScenarioComparison()

                    console.log("done loading")


                })
        },
        watch: {}

    }
</script>


<style scoped lang="scss">


</style>
