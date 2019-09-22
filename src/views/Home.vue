<template>

    <v-container class="home" v-if="api.loadingState==='complete'">
        <div style="position: fixed; top:0; left:0; right:0;background: #fff; z-index:1000;">
            <v-container>
                <v-layout>
                    <v-flex xs12>
                        <usage-report :yearly-snaps="yearlySummarySnaps" overview="true"></usage-report>
                    </v-flex>

                </v-layout>
            </v-container>
        </div>


        <!--                        <v-layout>-->
        <!--                            <pre>-->
        <!--                                {{ }}-->
        <!--                            </pre>-->
        <!--                        </v-layout>-->

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

                                        </div>
                                    </v-flex>
                                </v-layout>

                                <!-- journal USAGE section -->
                                <v-layout>
                                    <usage-report :yearly-snaps="journal.getSubscriptionSnaps()"></usage-report>
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
                                        <v-flex xs3 class="mx-2" style="cursor:pointer;" @click="journal.subscribe(useType.name)">
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
                            :total-visible="12"
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
            api: api,

        }),
        computed: {
            journalsForPage() {
                let startIndex = (this.currentPage - 1) * this.pageSize
                let endIndex = (this.currentPage * this.pageSize) - 1
                return this.journals.slice(startIndex, endIndex)
            },

            yearlySummarySnaps() {
                const years = ["2020", "2021", "2022", "2023", "2024"]
                const ret = {}
                years.forEach(y => ret[y] = new SummarySnap())

                this.journals.forEach(journal => {
                    journal.getSubscriptionSnaps().forEach(snap => {
                        ret[snap.year].addSnap(snap)
                    })
                })
                return Object.values(ret)
            }
        },
        methods: {
            nf: nFormat,
            currency: currency
        },
        mounted() {
            api.fetchJournals()
                .then(resp => {
                    this.journalsFromApi = resp
                    this.journals = resp.map(x => {
                        let myJournal = new Journal(x, "free")
                        return myJournal

                    })
                })

        }
    }
</script>


<style scoped lang="scss">


</style>
