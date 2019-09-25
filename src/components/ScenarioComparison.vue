<template>
    <v-container v-scroll="onScroll" v-if="data.oldScenario" fluid class="scenario-comparison">
        <h3>scenario comparison</h3>


        <div :style="headerStyle">
            <v-container fluid>
                <v-layout>
                    <v-flex class="fulfillment-graph" shrink>
                        <downloads-chart
                                :yearly-subscriptions="data.newScenario.subscriptions.byYear">
                        </downloads-chart>

                    </v-flex>
                    <v-flex xs3>
                        <div class="text-xs-right">
                            <div class="body-1">Instant fulfillments</div>
                            <div class="headline">{{nf(data.newScenario.subscriptions.overall.getFulfilledUsesCount())}}</div>
<!--                            <div class="headline">{{nf(percentFulfillmentsChange), true}}%</div>-->

                        </div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text-xs-right">
                            <div class="body-1">Cost</div>
                            <div class="headline">{{currency(data.newScenario.subscriptions.overall.cost, true)}}</div>
<!--                            <div class="headline">{{// nf(percentCostChange), true}}%</div>-->

                        </div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text-xs-right">
                            <div class="body-1">Cost per paid usage</div>
                            <div class="headline">{{currency(data.newScenario.subscriptions.overall.costPerPaidUse())}}</div>
<!--                            <div class="headline">{{currency(pricePerPaidUseChange)}}</div>-->
                        </div>
                    </v-flex>

                </v-layout>
            </v-container>
        </div>


        <!--- Summary area  -->
        <v-layout v-if="true" row style="padding-top:100px; background: #fff;">
            <v-container fluid>
                <v-layout>
                    <v-flex xs6>
                        <v-layout>
                            <v-flex>
                                <h3 class="display-1">Working scenario </h3>
                            </v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex shrink class="pr-2">
                                <downloads-chart
                                        :yearly-subscriptions="data.newScenario.subscriptions.byYear"></downloads-chart>
                            </v-flex>
                            <v-flex>
                                <usage-table
                                        :subscription="data.newScenario.subscriptions.overall">
                                </usage-table>
                            </v-flex>
                        </v-layout>
                    </v-flex>


                    <v-flex xs6>
                        <v-layout>
                            <v-flex>
                                <h3 class="display-1">Big Deal scenario </h3>
                            </v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex shrink class="pr-2">
                                <downloads-chart
                                        :yearly-subscriptions="data.oldScenario.subscriptions.byYear"></downloads-chart>

                            </v-flex>
                            <v-flex>
                                <usage-table
                                        :subscription="data.oldScenario.subscriptions.overall">
                                </usage-table>
                            </v-flex>
                        </v-layout>


                        <!--                        <usage-table :subscription="data.oldScenario.subscriptions.overall"></usage-table>-->

                    </v-flex>

                </v-layout>
            </v-container>
        </v-layout>


    </v-container>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import DownloadsChart from "../components/DownloadsChart"
    import UsageReport from "../components/UsageReport"
    import UsageTable from "../components/UsageTable"
    import {currency, nFormat, sumObjects} from "../util";


    export default {
        name: "Journal",
        props: ["data"],
        components: {
            DownloadsBar,
            DownloadsChart,
            UsageReport,
            UsageTable
        },
        data: () => ({
            scrollY: 0
        }),
        methods: {
            nf: nFormat,
            currency: currency,
            onScroll(e){
                this.scrollY = window.scrollY
            }
        },
        computed: {
            headerStyle(){
                const ret = {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    background: "#fff",
                    "z-index": 1000,
                }
                if (this.scrollY > 10) {
                    ret['box-shadow'] = "0 1px 10px 1px rgba(0, 0, 0, .3)"
                }

                return ret

            }

        },
        watchers() {
        }
    }
</script>

<style scoped>

</style>