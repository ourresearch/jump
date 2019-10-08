<template>
    <v-container v-if="scenarioNew.journalsList.length" fluid class="data-toolbar">
        <v-layout class="py-1 px-3">
            <!-- num journals -->
            <v-flex xs3>
                <v-layout>
                    <v-flex xs1 class="graphic mr-2">
                        <div style="height: 100%; flex-grow: 1">
                            <downloads-bar
                                    :segments="display.barSegments(scenarioNew.getSubrTable())"></downloads-bar>
                        </div>
                    </v-flex>
                    <v-flex grow class="data">
                        <div>
                            <div class="num headline">
                                {{nf(scenarioNew.getSubrTable().fullSubscription)}}
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
                                 v-for="(usageDict, year) in scenarioNew.getUsageByYear()">
                                <downloads-bar :year="year"
                                               :segments="display.barSegments(usageDict)">
                                </downloads-bar>
                            </div>
                        </div>
                    </v-flex>
                    <v-flex grow class="data">
                        <div>
                            <div class="num headline">
                                {{(scenarioNew.getPercInstantAccess()).toFixed(2)}}%
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
                             v-for="(costsDict, year) in scenarioNew.getCostByYear()">
                            <downloads-bar :year="year"
                                           :is-currency="true"
                                           :segments="display.barSegments(costsDict)">
                            </downloads-bar>
                        </div>
                    </v-flex>

                    <v-flex grow class="data">
                        <div>
                            <div class="num headline">
                                {{currency(scenarioNew.getCostTotal())}}
                            </div>
                            <div class="name body-1">
                                Total Cost
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
        props: ["scenarioNew"],
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