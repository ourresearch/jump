<template>
    <div class="home">

        <v-container fluid grid-list-lg v-if="store.loadingState=='complete'">

            <v-layout row>
                <v-flex xs3></v-flex>
                <v-flex xs9>
                    <timeline :timeline="store.baselineScenario"></timeline>
                </v-flex>
            </v-layout>

            <v-layout row>
                <v-flex xs3></v-flex>
                <v-flex xs9>
                    <timeline :timeline="newScenario"></timeline>
                </v-flex>
            </v-layout>



            <v-layout row>
                <v-flex md3>
                    filters aqui
                    <v-btn @click="uncheckEverything">
                        <div>
                            <i class="fas fa-radiation"></i>
                            scorched earth
                        </div>
                    </v-btn>
                </v-flex>


                <v-flex md9>
                    <v-container>
                        <v-layout>
                            sorting by price per requested item.
                        </v-layout>
                        <v-layout column>

                            <!-- journal row -->
                            <v-flex class="journal-row" v-for="(journal, index) in sortedJournals">
                                <v-container>
                                    <v-layout align-items-top>
                                        <v-flex shrink>
                                            <v-checkbox class="mt-0"
                                                        v-model="journal.timeline.subscribed"
                                            ></v-checkbox>
                                        </v-flex>

                                        <v-flex grow>
                                            <v-layout>
                                                <v-flex>
                                                    <span class="name headline">
                                                        {{journal.title}}
                                                    </span>
                                                    <span class="topic body-1">
                                                        {{ journal.subject}}
                                                    </span>
                                                </v-flex>
                                            </v-layout>

                                            <v-layout>
                                                <v-flex>
                                                    <timeline :timeline="journal.timeline"></timeline>
                                                </v-flex>
                                            </v-layout>
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


    </div>
</template>


<script>
    import axios from 'axios'
    import {store} from "../search.js"
    import DownloadsBar from "../components/DownloadsBar"
    import Timeline from "../components/Timeline"

    export default {
        name: 'Home',
        components: {
            DownloadsBar,
            Timeline
        },
        data: () => ({
            store: store,
            currentPage: 1

        }),
        computed: {
            numPages(){
                return store.journals.length / 40
            },
            pageMinIndex(){
                return 0
            },
            pageMaxIndex(){
                return 40
            },
            sortedJournals(){
                return store.getSorted()
            },
            newScenario(){
                return store.getNewScenario()
            }

        },
        methods: {
            uncheckEverything(){
                console.log("uncheck everything!")
                this.store.journals.map(journal=>{
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
