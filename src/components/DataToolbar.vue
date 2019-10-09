<template>
    <v-container v-if="scenario.journalsList" fluid class="data-toolbar pa-0 ma-0">
        <v-layout class="py-1 px-3">
            <!-- num journals -->
            <v-flex xs3>
                <v-layout>
                    <v-flex xs1 class="graphic mr-2">
                        <div style="height: 100%; flex-grow: 1">
                            <downloads-bar
                                    :segments="display.barSegments(scenario.getSubrTable())"></downloads-bar>
                        </div>
                    </v-flex>
                    <v-flex grow class="data">
                        <div>
                            <div class="num headline">
                                {{nf(scenario.getSubrTable().fullSubscription)}}
                            </div>
                            <div class="name body-1">
                                Subscriptions
                            </div>
                        </div>
                    </v-flex>
                </v-layout>
            </v-flex>


            <!-- usage -->
            <v-flex xs3>
                <v-layout>
                    <v-flex xs2 class="graphic mr-2">
                        <div style="height: 100%; flex-grow: 1; display:flex;">
                            <div :key="year"
                                 style="height: 50px; flex-grow: 1"
                                 v-for="(usageDict, year) in scenario.getUsageByTypeByYear()">
                                <downloads-bar :year="year"
                                               :segments="display.barSegments(usageDict)">
                                </downloads-bar>
                            </div>
                        </div>
                    </v-flex>
                    <v-flex grow class="data">
                        <div>
                            <div class="num headline">
                                {{(scenario.getPercInstantAccess()).toFixed(2)}}%
                            </div>
                            <div class="name body-1">
                                Instant access
                            </div>
                        </div>
                    </v-flex>
                </v-layout>
            </v-flex>


            <!-- cost -->
            <v-flex xs3>
                <v-layout>
                    <v-flex xs2 class="graphic mr-2" style="display:flex;">
                        <div :key="year"
                             style="height: 50px; flex-grow: 1"
                             v-for="(costsDict, year) in scenario.getCostByTypeByYear()">
                            <downloads-bar :year="year"
                                           :is-currency="true"
                                           :segments="display.barSegments(costsDict)">
                            </downloads-bar>
                        </div>
                    </v-flex>

                    <v-flex grow class="data">
                        <div>
                            <div class="num headline">
                                {{currency(scenario.getCostTotal())}}
                            </div>
                            <div class="name body-1">
                                Avg annual Cost
                            </div>
                        </div>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>


    </v-container>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import {currency, nFormat} from "../util";
    import * as display from "../display"


    export default {
        name: "DataToolbar",
        props: ["scenario"],
        components: {
            DownloadsBar,
        },
        data: () => ({
            display:display,
        }),
        methods: {
            nf: nFormat,
            currency: currency,
        },
        computed: {},
        watchers() {
        }
    }
</script>

<style scoped>

</style>