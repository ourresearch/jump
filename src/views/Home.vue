<template>
    <div class="home">

        <v-container fluid grid-list-lg v-if="store.loadingState=='complete'">
            <v-layout row>

                <v-flex xs2 >
                    <div class="label">
                        baseline:
                    </div>
                    <div>
<!--                        <pre>{{store.getNewScenario().getSnaps()}}</pre>-->
                    </div>


                    <div style="height: 100px;">
<!--                        <access-graph style="height: 100px;" :scenario="store.baselineScenario"></access-graph>-->

                    </div>
                </v-flex>
                <v-flex xs2 class="ml-5">
<!--                    <div class="label">-->
<!--                        new: {{store.getSelected().length}} journals-->
<!--                    </div>-->
<!--                    <div style="height: 100px;">-->
<!--                        <access-graph style="height: 100px;" :scenario="store.getNewScenario()"></access-graph>-->

<!--                    </div>-->
                </v-flex>


            </v-layout>



            <v-layout row>
                <v-flex md3>
                    filters aqui
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




<!--                                            <v-layout>-->
<!--                                                <v-flex xs3>-->
<!--                                                    <div class="access text-xs-right">-->
<!--                                                        <div>Downloads purchased:</div>-->
<!--                                                        <div class="display-2">-->
<!--                                                            {{ journal.scenario.overall.raw.purchased.toLocaleString() }}-->
<!--                                                        </div>-->
<!--                                                        <div>-->
<!--                                                            {{ Math.round(journal.scenario.overall.prop.purchased*100) }}% of {{ journal.scenario.overall.total.toLocaleString() }} total-->
<!--                                                        </div>-->
<!--                                                    </div>-->


<!--                                                </v-flex>-->


<!--                                                <v-flex xs2 class="ml-2 pb-0">-->
<!--                                                    <access-graph style="height: 100%;" :scenario="journal.scenario"></access-graph>-->


<!--                                                </v-flex>-->
<!--                                                <v-flex xs3>-->
<!--                                                    <div class="prices text-xs-right">-->
<!--                                                        <div>Price per:</div>-->
<!--                                                        <div class="display-2">-->
<!--                                                            ${{ journal.scenario.overall.pricePer.purchased.toLocaleString() }}-->
<!--                                                        </div>-->
<!--                                                        <div>-->
<!--                                                            ${{ journal.scenario.overall.cost.toLocaleString() }} total-->
<!--                                                        </div>-->
<!--                                                    </div>-->
<!--                                                </v-flex>-->



<!--                                            </v-layout>-->


                                        </v-flex>
                                        <v-flex xs2 class="text-xs-right">
<!--                                            ${{  journal.dollars_2018_subscription}}-->
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
            }

        },
        methods: {},
        mounted() {
            store.fetchResults()
        }
    }
</script>


<style scoped lang="scss">


</style>
