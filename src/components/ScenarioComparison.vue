<template>
    <v-container v-if="data.oldScenario" fluid class="scenario-comparison">
        <h3>scenario comparison</h3>


<!--        <div v-if="true" style="position: fixed; top:0; left:0; right:0;background: #fff; z-index:1000;">-->
<!--            <v-container fluid>-->
<!--                <v-layout>-->
<!--                    <v-flex class="fulfillment-graph text-xs-left" xs1>-->
<!--                        <downloads-chart-->
<!--                                :overall-use-counts="overallSnap"-->
<!--                                :yearly-use-counts="yearlySummarySnaps"-->
<!--                        ></downloads-chart>-->
<!--                    </v-flex>-->
<!--                    <v-flex xs3>-->
<!--                        <div class="text-xs-right">-->
<!--                            <div class="body-1">Instant fulfillments</div>-->
<!--                            <div class="headline">{{nf(overallSnap.getFulfilledCount(), true)}}</div>-->
<!--                            <div class="headline">{{nf(percentFulfillmentsChange), true}}%</div>-->

<!--                        </div>-->
<!--                    </v-flex>-->
<!--                    <v-flex xs3>-->
<!--                        <div class="text-xs-right">-->
<!--                            <div class="body-1">Cost</div>-->
<!--                            <div class="headline">{{currency(overallSnap.getCost(), true)}}</div>-->
<!--                            <div class="headline">{{nf(percentCostChange), true}}%</div>-->

<!--                        </div>-->
<!--                    </v-flex>-->
<!--                    <v-flex xs3>-->
<!--                        <div class="text-xs-right">-->
<!--                            <div class="body-1">Cost per paid usage</div>-->
<!--                            <div class="headline">{{currency(overallSnap.getCostPerPaidUse())}}</div>-->
<!--                            <div class="headline">{{currency(pricePerPaidUseChange)}}</div>-->
<!--                        </div>-->
<!--                    </v-flex>-->

<!--                </v-layout>-->
<!--            </v-container>-->
<!--        </div>-->


        <!--- Summary area  -->
        <v-layout v-if="true" row style="padding-top:200px; background: #fff;">
            <v-container fluid>
                <v-layout>
                    <v-flex xs6>
                        <h3 class="display-1">Working scenario </h3>
                        <pre>{{data.newScenario.subscriptions.overall.usageStats()}}</pre>
                    </v-flex>

                    <v-flex xs6>
                        <h3 class="display-1">Big Deal scenario </h3>
                        <pre>{{data.oldScenario.subscriptions.overall.usageStats()}}</pre>


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

        }),
        methods: {
            nf: nFormat,
            currency: currency,
        },
        computed: {

        },
        watchers(){
        }
    }
</script>

<style scoped>

</style>