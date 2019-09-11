<template>
    <div class="home">

        <v-container fluid grid-list-lg>
            <v-layout row>
                <v-flex xs12>
                    <h1 class="display-4">jump!</h1>
                    <div>top stuff aqui</div>
                </v-flex>
            </v-layout>
            <v-layout row>
                <v-flex md3>
                    filters aqui
                </v-flex>
                <v-flex md9>

                    <div class="journal-row" v-for="journal in store.journals.slice(0, 50)">
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
                                        <v-flex xs4>
                                            <v-layout style="height: 100px">
                                                <v-flex class="pa-0 pr-1 year"  v-for="year in journal.years">
                                                    <div class="turnaways" :style="{background: 'gray', height: year.prop.turnaways*100 +'%'}"></div>
                                                    <div class="oa" :style="{background: 'orange', height: year.prop.oa*100 +'%'}"></div>
                                                    <div class="back-catalog" :style="{background: 'mediumblue', height: year.prop.backCatalog*100 +'%'}"></div>


                                                </v-flex>
                                            </v-layout>
                                        </v-flex>




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
                                    ${{journal.dollars_2018_subscription.toLocaleString()}}
                                </v-flex>
                            </v-layout>


                        </v-container>


                    </div>
                </v-flex>


            </v-layout>


        </v-container>


    </div>
</template>


<script>
    import axios from 'axios'
    import {store} from "../search.js"

    export default {
        name: 'Home',
        data: () => ({
            store: store

        }),
        computed: {},
        methods: {},
        mounted() {
            store.fetchResults()
        }
    }
</script>


<style scoped lang="scss">


</style>
