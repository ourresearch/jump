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

                    <div class="journal-row" v-for="journal in store.journals.slice(0, 100)">
                        <v-container>
                            <v-layout>
                                <v-flex shrink>
                                    <v-checkbox
                                    ></v-checkbox>
                                </v-flex>
                                <v-flex xs10>
                                    <div class="name headline">
                                        {{journal.title}}
                                    </div>
                                    <div class="topic">
                                        {{ journal.subject}}
                                    </div>
                                </v-flex>
                                <v-flex xs2 class="text-xs-right">
                                    ${{journal.dollars_2018_subscription.toLocaleString()}}
                                </v-flex>
                            </v-layout>

                            <v-layout>
                                <v-flex>
                                    downloads: {{journal.downloads_next_3_years.total.toLocaleString()}} (
                                    <span>{{ Math.round(journal.downloads_next_3_years.back_catalog / journal.downloads_next_3_years.total * 100) }}% back catalog, </span>
                                    <span>{{ Math.round(journal.downloads_next_3_years.oa / journal.downloads_next_3_years.total * 100) }}% OA, </span>
                                    <span>{{ Math.round(journal.downloads_next_3_years.turnaways / journal.downloads_next_3_years.total * 100) }}% turnaway</span>
                                    )
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
