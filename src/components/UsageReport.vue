<template>
    <v-container class="timeline pa-2">

        <v-layout align-items-top class="text-xs-right">

<!--            <v-flex>-->
<!--                <pre class="text-xs-left">-->
<!--                {{yearlySnaps[0].getUses()}}-->

<!--                </pre>-->
<!--            </v-flex>-->


            <v-flex class="fulfillment-graph text-xs-left" xs1>
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


            <v-flex xs9 class="fulfilled-uses mx-4 px-4">
                <v-layout class="heading-row">
                    <v-flex class="use py-0" xs6>
                        Fulfillments
                    </v-flex>

                    <v-flex class="cost py-0" xs3>
                        Costs
                    </v-flex>
                    <v-flex class="cost-per-use py-0" sx3>
                        Cost per paid use
                    </v-flex>
                </v-layout>

                <v-layout class="main-row main-number">
                    <v-flex class="use py-0" xs6>
                        {{ nf(overallSnap.getFulfilledCount()) }}
                    </v-flex>

                    <v-flex class="cost py-0" xs3>
                        ${{nf(overallSnap.getTotalCost())}}
                    </v-flex>
                    <v-flex class="cost-per-use py-0" sx3>
                        ${{ nf(overallSnap.getCostPerPaidUse(), true) }}
                    </v-flex>
                </v-layout>


                <v-layout class="mod-row equipped" v-for="mod in overallSnap.getFulfillments()">
                    <v-flex class="use py-0" xs6>
                        <v-layout>
                            <v-flex xs4 class="text-xs-left">
                                <a v-if="mod.isPaid" @click="$emit('clearSubscriptions')">
                                    -remove
                                </a>
                            </v-flex>
                            <v-flex xs4 class="text-xs-left">{{mod.name}}</v-flex>
                            <v-flex xs4>{{ nf(mod.count) }}</v-flex>
                        </v-layout>
                    </v-flex>

                    <v-flex class="cost py-0" xs3>
                        <span v-if="mod.price > 0">
                            ${{nf(mod.price)}}
                        </span>
                    </v-flex>
                    <v-flex class="cost-per-use py-0" sx3>
                        <span v-if="mod.price > 0">
                            ${{mod.pricePerCount.toFixed(2) }}
                        </span>
                    </v-flex>
                </v-layout>

            </v-flex>


            <v-flex class="turnaway-uses py-0" xs2 style="border-left: 1px solid #999;">
                <div class="heading">Turnaways</div>
                <div class="main-number">
                    {{ nf(turnawayCounts.total) }}
                </div>
                <div class="under-number">
                    {{ nf(turnawayCounts.soft)}} soft
                </div>
                <div class="under-number">
                    {{ nf(turnawayCounts.hard)}} hard
                </div>
            </v-flex>


        </v-layout>


    </v-container>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import {store} from "../search.js"
    import SummarySnap from "../SummarySnap"

    export default {
        name: "UsageReport",
        props: ["yearlySnaps", "overview"],
        components: {
            DownloadsBar
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
            },
            turnawayCounts(){
                const soft = this.overallSnap.getUses().softTurnaway
                const hard = this.overallSnap.getUses().hardTurnaway

                return {
                    soft: soft.count,
                    hard: hard.count,
                    total: soft.count + hard.count
                }
            }
        },
        mounted(){
            if (this.overview){
                console.log("overview usagereport mounted. yearlySnaps", this.yearlySnaps)
            }
            else{
                console.log("journal usagereport mounted. yearlySnaps", this.yearlySnaps)

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