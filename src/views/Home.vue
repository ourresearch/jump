<template>

    <v-container class="home" fluid grid-list-lg v-if="api.loadingState==='complete'">
        <v-layout row style="position: fixed; top:0; left:0; right:0;background: #fff; z-index:1000;">
            <v-flex xs3></v-flex>
            <v-flex xs9>
                <!--                            <timeline :journal-years="journalYears"></timeline>-->


                <!--                            <pre>-->
                <!--                                {{overallUses.map(x=>[x.name, x.count])}}-->
                <!--                            </pre>-->
            </v-flex>
        </v-layout>


        <!--                <v-layout>-->
        <!--                    <pre>-->
        <!--                        {{store.user}}-->
        <!--                    </pre>-->
        <!--                </v-layout>-->

        <!--- working area  -->
        <v-layout row style="padding-top:200px;">
            <!--            <v-flex md3>-->
            <!--                filters aqui-->
            <!--                <v-btn @click="uncheckEverything">-->
            <!--                    <div>-->
            <!--                        <i class="fas fa-radiation"></i>-->
            <!--                        scorched earth-->
            <!--                    </div>-->
            <!--                </v-btn>-->
            <!--            </v-flex>-->


            <!--- journals list  -->
            <v-flex md12>
                <v-container>
                    <v-layout>
                        sorting by price per requested item.
                    </v-layout>

                    <v-layout column>

                        <!-- journal row -->
                        <v-flex class="journal-row" v-for="journal in journalsForPage">
                            <v-container>
                                <v-layout align-items-top>
                                    <v-flex shrink>
                                        <v-checkbox class="pa-0 mt-1"></v-checkbox>
                                    </v-flex>

                                    <v-flex grow>
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

                                                </div>
                                            </v-flex>
                                        </v-layout>

                                        <v-layout>
                                            <usage-report :yearly-snaps="journal.getSubscriptionSnaps()"></usage-report>
                                        </v-layout>

                                    </v-flex>

                                </v-layout>


                            </v-container>


                        </v-flex>


                    </v-layout>
                    <v-layout>
                        <v-pagination
                                class="ma-4"
                                v-model="currentPage"
                                :length="Math.ceil(journalsFromApi.length / pageSize)"
                                :total-visible="12"
                        ></v-pagination>
                    </v-layout>


                </v-container>

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




    export default {
        name: 'Home',
        components: {
            DownloadsBar,
            UsageReport,
        },
        data: () => ({
            store: store,
            currentPage: 1,
            pageSize: 3,
            sortBy: "default",
            journalsFromApi: [],
            journals: [],
            api: api

        }),
        computed: {
            journalsForPage() {
                let startIndex = (this.currentPage - 1) * this.pageSize
                let endIndex = (this.currentPage * this.pageSize) - 1
                return this.journals.slice(startIndex, endIndex)
            },

            yearlySummariesDict(){
                const years = ["2020","2021","2022","2023","2024"]
                const ret = {}
                years.forEach(y=>ret[y] = new SummarySnap())

                this.journals.forEach(journal => {
                    journal.getSubscriptionSnaps().forEach(snap=>{
                        ret[snap.year].addSnap(snap)
                    })
                })
                return ret
            }
        },
        methods: {
        },
        mounted() {
            api.fetchJournals()
                .then(resp => {
                    this.journalsFromApi = resp
                    this.journals = resp.map(x => {
                        let myJournal = new Journal(x, "fullSubscription")
                        return myJournal

                    })
                })

        }
    }
</script>


<style scoped lang="scss">


</style>
