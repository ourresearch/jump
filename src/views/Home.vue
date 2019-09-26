<template>

    <v-container  fluid class="home pa-0" v-if="api.loadingState==='complete'">
        <div class="loading"  style="position: fixed; top:0; left:0; right:0;background: orangered; z-index:10000;" v-if="isLoading">loading</div>




        <scenario-comparison
                :data="scenarioComparison"
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
            journalsDict:{},
            bigDealCost: 1000000,
            journalsToPrint: [],
            apiJournals: {},
            scenarioComparison: {},
            oldScenario: {}

        }),
        computed: {

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
            getSubscription(issnl){
                if (this.subscriptions[issnl]) return  this.subscriptions[issnl]
                return "free"
            },

            printScenarioComparison(){
                this.scenarioComparison = makeScenarioComparison(
                    makeScenario(
                        Object.values(this.journalsDict),
                        0
                    ),
                    this.oldScenario
                )
            },

            subscribe(args){
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
            printJournalsDict(){
                const sortKey = this.selectedJournalSortKey
                console.log("printing journals dict!", sortKey)
                const sortFn = function(a,b){
                    let ret = 0
                    a
                    if (a.sortKeys[sortKey] <  b.sortKeys[sortKey]) {
                        ret = -1
                    }
                    else {
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
                    resp.forEach(apiJournalData=>{
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
        watch: {
        }

    }
</script>


<style scoped lang="scss">


</style>
