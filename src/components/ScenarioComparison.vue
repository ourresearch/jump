<template>
    <v-container fluid class="scenario-comparison">
        <div v-if="true" style="position: fixed; top:0; left:0; right:0;background: #fff; z-index:1000;">
            <v-container fluid>
                <v-layout>
                    <v-flex class="fulfillment-graph text-xs-left" xs1>
                        <div style="display: flex; width:100%; height: 100%; min-height: 50px;">
                            <downloads-bar
                                    :snap="overallSnap"
                                    class="pr-1"
                                    style="flex-grow:3;">
                            </downloads-bar>

                            <downloads-bar
                                    v-for="snap in yearlySummarySnaps"
                                    :year="snap.year"
                                    style="flex-grow: 1;"
                                    :snap="snap"></downloads-bar>
                        </div>
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
    import UsageReport from "../components/UsageReport"
    import {currency, nFormat} from "../util";

    export default {
        name: "Journal",
        props: ["yearlySummarySnaps", "overallSnap", "bigDealYearlySummarySnaps", "bigDealOverallSnap"],
        components: {
            DownloadsBar,
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