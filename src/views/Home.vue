<template>

    <v-container class="home" fluid grid-list-lg v-if="store.loadingState=='complete'">


         running total
                    <v-layout row style="position: fixed; top:0; left:0; right:0;background: #fff; z-index:1000;">
                        <v-flex xs3></v-flex>
                        <v-flex xs9>
<!--                            <pre>-->
<!--                                {{overallUseReport}}-->
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
                        <v-flex class="journal-row" v-for="(issnl, index) in store.getSortedJournalKeys()">
                            <v-container>
                                <v-layout align-items-top>
                                    <v-flex shrink>
                                        <v-checkbox class="pa-0 mt-1"></v-checkbox>
                                    </v-flex>

                                    <v-flex grow>

                                        <journal :issnl="issnl"></journal>




<!--                                            <timeline :stats="journal.statsByYear"></timeline>-->
                                    </v-flex>

                                </v-layout>


                            </v-container>


                        </v-flex>


                    </v-layout>
                    <v-layout>
                        <v-pagination
                                class="ma-4"
                                v-model="store.page"
                                :length="store.getNumPages()"
                                :total-visible="12"
                        ></v-pagination>
                    </v-layout>


                </v-container>

            </v-flex>


        </v-layout>


    </v-container>


</template>


<script>
    import axios from 'axios'
    import {store} from "../search.js"
    import DownloadsBar from "../components/DownloadsBar"
    import Timeline from "../components/Timeline"
    import Journal from "../components/Journal"

    export default {
        name: 'Home',
        components: {
            DownloadsBar,
            Timeline,
            Journal
        },
        data: () => ({
            store: store,
            currentPage: 1

        }),
        computed: {
            numPages() {
                return store.journals.length / 40
            },
            pageMinIndex() {
                return 0
            },
            overallUseReport() {
                return this.store.overallUseReport()
            },
            pageMaxIndex() {
                return 40
            },
            newScenario() {
                return store.getNewScenario()
            }

        },
        methods: {
            uncheckEverything() {
                console.log("uncheck everything!")
                this.store.journals.map(journal => {
                    journal.timeline.subscribed = false
                })
            }
        },
        mounted() {
            store.fetchResults()
        }
    }
</script>


<style scoped lang="scss">


</style>
