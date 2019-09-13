<template>
    <div class="home">

        <v-container fluid grid-list-lg>
            <v-layout row>
                <v-flex xs12>
                    <div>journals selected: {{ store.getSelected().length }}</div>
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
                            <v-flex class="journal-row" v-for="(journal, index) in sortedJournals">
                                <v-container>
                                    <v-layout align-items-top>
                                        <v-flex shrink>
                                            <v-checkbox class="mt-0"
                                                        v-model="journal.selected"
                                            ></v-checkbox>
                                        </v-flex>

                                        <v-flex xs10>
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
                                                <v-flex xs1>
                                                    <v-layout style="height: 50px">
                                                        <v-flex
                                                                class="pa-0 year"
                                                                style="border-right: 1px solid #fff;"
                                                                v-for="snap in journal.timeline"
                                                        >

                                                            <downloads-bar :snap="snap"></downloads-bar>
                                                        </v-flex>
                                                    </v-layout>
                                                </v-flex>


                                                <!-- overall -->
<!--                                                <v-flex xs1 class="pl-3 pr-5">-->
<!--                                                    <v-layout style="height: 50px">-->
<!--                                                        <v-flex class="pa-0 overall">-->

<!--                                                            <v-tooltip top>-->
<!--                                                                <template v-slot:activator="{ on }">-->
<!--                                                                    <div class="turnaways" v-on="on"-->
<!--                                                                         :style="{background: 'gray', height: journal.windowTotals.prop.turnaways*100 +'%'}"></div>-->
<!--                                                                </template>-->
<!--                                                                <span>window turnaways: {{ Math.round(journal.windowTotals.prop.turnaways*100) + "%" }} ({{ journal.windowTotals.raw.turnaways.toLocaleString() }} total)</span>-->
<!--                                                            </v-tooltip>-->

<!--                                                            <v-tooltip right>-->
<!--                                                                <template v-slot:activator="{ on }">-->
<!--                                                                    <div class="oa" v-on="on"-->
<!--                                                                         :style="{background: 'orange', height: journal.windowTotals.prop.oa*100 +'%'}"></div>-->
<!--                                                                </template>-->
<!--                                                                <span>window OA: {{ Math.round(journal.windowTotals.prop.oa*100) + "%" }}</span>-->
<!--                                                            </v-tooltip>-->

<!--                                                            <v-tooltip bottom>-->
<!--                                                                <template v-slot:activator="{ on }">-->
<!--                                                                    <div class="back-catalog" v-on="on"-->
<!--                                                                         :style="{background: 'mediumblue', height: journal.windowTotals.prop.backCatalog*100 +'%'}"></div>-->
<!--                                                                </template>-->
<!--                                                                <span>window Back catalog: {{ Math.round(journal.windowTotals.prop.backCatalog*100) + "%" }}</span>-->
<!--                                                            </v-tooltip>-->


<!--                                                        </v-flex>-->
<!--                                                    </v-layout>-->
<!--                                                </v-flex>-->


<!--                                                <v-flex shrink>-->
<!--                                                    <table>-->
<!--                                                        <tr>-->
<!--                                                            <td>price per download</td>-->
<!--                                                            <td>${{journal.windowTotals.pricePer.download.toFixed(2)}}</td>-->
<!--                                                        </tr>-->
<!--                                                        <tr>-->
<!--                                                            <td>price per unfulfilled download</td>-->
<!--                                                            <td>${{journal.windowTotals.pricePer.turnaways.toFixed(2)}}</td>-->
<!--                                                        </tr>-->
<!--                                                        <tr>-->
<!--                                                            <td>price per requested download</td>-->
<!--                                                            <td>${{journal.windowTotals.pricePer.requestedItem.toFixed(2)}}</td>-->
<!--                                                        </tr>-->
<!--                                                    </table>-->
<!--                                                </v-flex>-->
<!--                                                <v-flex shrink>-->
<!--                                                    <table>-->
<!--                                                        <tr>-->
<!--                                                            <td>-->
<!--                                                                annual DocDel:-->
<!--                                                            </td>-->
<!--                                                            <td>-->
<!--                                                                ${{ journal.windowTotals.priceWithDocdel.toLocaleString() }}-->
<!--                                                            </td>-->
<!--                                                        </tr>-->
<!--                                                        <tr>-->
<!--                                                            <td>annual DocDel savings</td>-->
<!--                                                            <td>-->
<!--                                                                ${{(journal.dollars_2018_subscription - journal.windowTotals.priceWithDocdel).toLocaleString()}}-->
<!--                                                            </td>-->
<!--                                                        </tr>-->
<!--                                                    </table>-->
<!--                                                </v-flex>-->



                                                <!--                                        <v-flex>-->
                                                <!--                                            downloads: {{journal.downloads_next_3_years.total.toLocaleString()}} (-->
                                                <!--                                            <span>{{ Math.round(journal.downloads_next_3_years.back_catalog / journal.downloads_next_3_years.total * 100) }}% back catalog, </span>-->
                                                <!--                                            <span>{{ Math.round(journal.downloads_next_3_years.oa / journal.downloads_next_3_years.total * 100) }}% OA, </span>-->
                                                <!--                                            <span>{{ Math.round(journal.downloads_next_3_years.turnaways / journal.downloads_next_3_years.total * 100) }}% turnaway</span>-->
                                                <!--                                            )-->
                                                <!--                                        </v-flex>-->
                                            </v-layout>


                                        </v-flex>
                                        <v-flex xs2 class="text-xs-right">
                                            ${{journal.dollars_2018_subscription}}
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

    export default {
        name: 'Home',
        components: {
            DownloadsBar
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
