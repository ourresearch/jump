<template>

    <v-container fluid class="home pa-0" v-if="api.loadingState==='complete'">
        <div class="loading" style="position: fixed; top:0; left:0; right:0;background: orangered; z-index:10000;"
             v-if="isLoading">loading
        </div>


        <scenario-comparison
                :data="scenarioComparison"
        ></scenario-comparison>

        <v-layout><pre>{{selectedIssnls}}</pre></v-layout>

        <!--- working area  -->
        <!--- sort controls  -->
        <v-toolbar align-center class="toolbar pa-3" style="background: #ccc;">
            <v-flex shrink>
                <v-btn outline @click="selectAll">
                    Select all
                </v-btn>
            </v-flex>
            <v-flex shrink>
                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn
                                color="primary"
                                dark
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
                    <v-flex class="number">1-100 of 2200</v-flex>
                    <v-flex class="pr-4 pl-2">
                        <v-layout>
                            <v-flex>
                                <v-btn @click="changePage" flat icon class="ma-0">
                                    <i class="fas fa-angle-left"></i>
                                </v-btn>
                            </v-flex>
                            <v-flex>
                                <v-btn @click="changePage" flat icon class="ma-0">
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
                        label="Sort journals by"
                        @change="printJournalsDict"
                        outline
                ></v-select>
            </v-flex>
        </v-toolbar>


        <!--- journals list  -->
        <v-layout column>
            <v-flex grow v-for="journalData in journalsToPrint" class="ma-5">
                <v-layout>
                    <v-flex shrink>
                        <v-checkbox
                                v-model="selectedJournals[journalData.meta.issnl]"
                                @click="select(journalData.meta.issnl)"

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

    import DownloadsBar from "../components/DownloadsBar"
    import JournalRow from "../components/JournalRow"
    import ScenarioComparison from "../components/ScenarioComparison"

    import {currency, nFormat} from "../util";
    import {makeJournal} from "../subscription";
    import {makeScenario, makeScenarioComparison} from "../scenario";


    export default {
        name: 'Home',
        components: {
            DownloadsBar,
            ScenarioComparison,
            JournalRow
        },
        data: () => ({
            currentPage: 1,
            pageSize: 20,
            sortBy: "default",
            journalsFromApi: [],
            journals: [],
            bigDealJournals: [],
            api: api,
            isLoading: false,
            selectedJournalSortKey: "getUseCount",
            journalSortKeys: [
                {text: "Best Cost Per Paid Use", value: "bestCostPerPaidUse"},
                {text: "Total usage", value: "getUseCount"},
                {text: "Hard turnaways", value: "hardTurnawayCount"},
                {text: "Title", value: "title"},
            ],
            journalsDict: {},
            bigDealCost: 1000000,
            journalsToPrint: [],
            apiJournals: {},
            scenarioComparison: {},
            oldScenario: {},
            subscriptionNames: [
                "fullSubscription",
                "docdel",
                "free"
            ],
            selectedIssnls: [],

        }),
        computed: {

            pageStartIndex() {
                return (this.currentPage - 1) * this.pageSize
            },
            pageEndIndex() {
                return (this.currentPage * this.pageSize) - 1
            },
            selectedJournals(){
                let ret = {}
                Object.keys(this.journalsDict).forEach(k=>{
                    ret[k] = false
                    if (this.selectedIssnls.includes(k)) {
                        ret[k] = true
                    }
                })
                return ret
            }


        },
        methods: {
            nf: nFormat,
            currency: currency,

            // selection stuff
            select(issnl) {
                this.selectedIssnls.push(issnl)
            },
            toggleSelection(issnl) {
                if (this.selectedIssnls.includes(issnl)){

                }
                this.selectedIssnls.push(issnl)
            },
            selectAll() {
                console.log("select all")
                this.selectedIssnls = Object.keys(this.journalsDict)
            },
            unselectAll() {
                this.selectedIssnls = []
            },
            isSelected(issnl){
                return this.selected.includes(issnl)
            },


            getSubscription(issnl) {
                if (this.subscriptions[issnl]) return this.subscriptions[issnl]
                return "free"
            },
            subscribeSelected(newSubscriptionName) {
                console.log("subscribe selected!", newSubscriptionName)

            },

            printScenarioComparison() {
                this.scenarioComparison = makeScenarioComparison(
                    makeScenario(
                        Object.values(this.journalsDict),
                        0
                    ),
                    this.oldScenario
                )
            },
            changePage() {
                console.log("change page")
            },

            subscribe(args) {
                console.log("subscribe!", args.issnl, args.subscriptionName)
                const myApiData = this.apiJournals[args.issnl]
                this.journalsDict[args.issnl] = makeJournal(
                    myApiData,
                    args.subscriptionName
                )


                this.printJournalsDict()
                this.printScenarioComparison()


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
            printJournalsDict() {
                const sortKey = this.selectedJournalSortKey
                console.log("printing journals dict!", sortKey)
                const sortFn = function (a, b) {
                    let ret = 0
                    a
                    if (a.sortKeys[sortKey] < b.sortKeys[sortKey]) {
                        ret = -1
                    } else {
                        ret = 1
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
                    resp.forEach(apiJournalData => {
                        const myIssnl = apiJournalData.meta.issnl

                        this.apiJournals[myIssnl] = apiJournalData
                        this.journalsDict[myIssnl] = makeJournal(
                            apiJournalData,
                            "fullSubscription"
                        )
                    })


                    this.oldScenario = makeScenario(
                        Object.values(this.journalsDict),
                        this.bigDealCost
                    )

                    this.printJournalsDict()
                    this.printScenarioComparison()
                })
        },
        watch: {}

    }
</script>


<style scoped lang="scss">


</style>
