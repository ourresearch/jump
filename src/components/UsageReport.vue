<template>
    <v-container style="min-height:150px" fluid class="timeline pa-2">

        <v-layout align-items-top class="text-xs-right">


            <v-flex class="fulfillment-graph text-xs-left" xs2>
                <div style="display: flex; width:100%; height: 100%; min-height: 50px;">
                    <downloads-bar
                            :snap="overallSnap"
                            class="pr-1"
                            style="flex-grow:3;">
                    </downloads-bar>

                    <downloads-bar
                            v-for="snap in yearlySnaps"
                            :year="snap.year"
                            style="flex-grow: 1;"
                            :snap="snap"></downloads-bar>
                </div>
            </v-flex>


            <v-flex xs10>
                <usage-type-row
                        name="total"
                        :count="overallSnap.getCount()"
                        :cost="overallSnap.getCost()"
                        :cost-per-paid-use="overallSnap.getCostPerPaidUse()"
                ></usage-type-row>

                <usage-type-row
                        v-for="usageType in overallSnap.getUses()"
                        v-if="usageType.count > 0.5"
                        :name="usageType.name"
                        :count="usageType.count"
                        :cost="usageType.cost"
                        :cost-per-paid-use="usageType.costPerCount"
                ></usage-type-row>


            </v-flex>



        </v-layout>


    </v-container>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import UsageTypeRow from "../components/UsageTypeRow"
    import {store} from "../search.js"
    import SummarySnap from "../SummarySnap"

    export default {
        name: "UsageReport",
        props: ["yearlySnaps", "overview"],
        components: {
            DownloadsBar,
            UsageTypeRow
        },
        data: () => ({
            store: store,
        }),
        methods: {
            currency(num) {
                let round = Math.round(num * 100) / 100
                return "$" + round.toLocaleString()
            },
            nf: store.nFormat,
            setSubscription(name){
                    this.store.setSubscription(this.issnl, name)
            }

        },
        computed: {

            // temp, to make this work for journal use case
            issnl(){
              return this.journalYears[0].issnl
            },
            potentialUses(){
                return use.makePotentialUses(this.journalYears)
            },


            // stays

            overallSnap(){
                return new SummarySnap(this.yearlySnaps)
            }
        }
    }
</script>

<style scoped lang="scss">
    .timeline {
        /*text-align: right;*/
    }


    .main-number {
        font-size: 30px;
    }

    .under-number {
        font-size: 12px;
    }


    .stat-col {
        text-align: right;

        .big-num {
            font-size: 30px;

            &.unsubscribed {
                opacity: 0.1;
            }
        }
    }

</style>