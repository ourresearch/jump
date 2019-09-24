<template>
    <v-container fluid class="scenario-comparison">
        <div v-if="true" style="position: fixed; top:0; left:0; right:0;background: #fff; z-index:1000;">
            <v-container fluid>
                <v-layout>
                    <v-flex class="fulfillment-graph text-xs-left" xs1>
                        <downloads-chart
                                :overall-use-counts="overallSnap"
                                :yearly-use-counts="yearlySummarySnaps"
                        ></downloads-chart>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text-xs-right">
                            <div class="body-1">Instant fulfillments</div>
                            <div class="headline">{{nf(overallSnap.getFulfilledCount(), true)}}</div>
                            <div class="headline">{{nf(percentFulfillmentsChange), true}}%</div>

                        </div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text-xs-right">
                            <div class="body-1">Cost</div>
                            <div class="headline">{{currency(overallSnap.getCost(), true)}}</div>
                            <div class="headline">{{nf(percentCostChange), true}}%</div>

                        </div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text-xs-right">
                            <div class="body-1">Cost per paid usage</div>
                            <div class="headline">{{currency(overallSnap.getCostPerPaidUse())}}</div>
                            <div class="headline">{{currency(pricePerPaidUseChange)}}</div>
                        </div>
                    </v-flex>

                </v-layout>
            </v-container>
        </div>


        <!--- Summary area  -->
        <v-layout v-if="true" row style="padding-top:200px; background: #fff;">
            <v-container fluid>
                <v-layout>
                    <v-flex xs6>
                        <h3 class="display-1">Working scenario </h3>
                        <usage-report style="min-height: 200px;" :yearly-snaps="yearlySummarySnaps"
                                      overview="true"></usage-report>
                    </v-flex>

                    <v-flex xs6>
                        <h3 class="display-1">Big Deal scenario </h3>
                        <usage-report style="min-height: 200px;" :yearly-snaps="bigDealYearlySummarySnaps"
                                      overview="true"></usage-report>
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
    import {currency, nFormat, sumObjects} from "../util";








    export default {
        name: "Journal",
        props: ["yearlySummarySnaps", "overallSnap", "bigDealYearlySummarySnaps", "bigDealOverallSnap"],
        components: {
            DownloadsBar,
            DownloadsChart,
            UsageReport
        },
        data: () => ({
            bigDealCost: 1000000
        }),
        methods: {
            nf: nFormat,
            currency: currency,
        },
        computed: {
            yearlyUseCounts(){

            },
            bigDealYearlyUseCounts(){

            },
            overallUseCounts(){
                return
            },
            bigDealOverallUseCounts(){

            },


            percentFulfillmentsChange(){
                return (this.overallSnap.getFulfilledCount() / this.bigDealOverallSnap.getFulfilledCount()) * 100
            },
            percentCostChange(){
                return (this.overallSnap.getCost() / this.bigDealCost) * 100
            },
            pricePerPaidUseChange(){
                const bigDealCostPerPaidUse = this.bigDealCost / this.bigDealOverallSnap.getPaidUsesCount()

                return bigDealCostPerPaidUse

                // return this.bigDealOverallSnap.getCostPerPaidUse() - this.overallSnap.getCostPerPaidUse()
            }
        },
        watchers(){
        }
    }
</script>

<style scoped>

</style>