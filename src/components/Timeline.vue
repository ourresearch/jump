<template>
    <v-container class="timeline pa-2">

        <v-layout align-items-top class="text-xs-right">

            <v-flex>
                <pre class="text-xs-left">
<!--                {{yearlyUses}}-->

                </pre>
            </v-flex>

            <v-flex class="fulfillment-graph text-xs-left" xs1>
                <div style="display: flex; width:100%; height: 40%;">
                    <downloads-bar
                            :mods="overallUses"
                            class="pr-1"
                            style="flex-grow:3;">
                    </downloads-bar>


                    <downloads-bar
                            v-for="yearSubscription in yearlyUses"
                            :year="yearSubscription.year"
                            :mods="yearSubscription.uses"></downloads-bar>

                </div>
            </v-flex>


<!--            <v-flex xs9 class="fulfilled-uses mx-4 px-4">-->
<!--                <v-layout class="heading-row">-->
<!--                    <v-flex class="use py-0" xs6>-->
<!--                        Fulfillments-->
<!--                    </v-flex>-->

<!--                    <v-flex class="cost py-0" xs3>-->
<!--                        Costs-->
<!--                    </v-flex>-->
<!--                    <v-flex class="cost-per-use py-0" sx3>-->
<!--                        Cost per paid use-->
<!--                    </v-flex>-->
<!--                </v-layout>-->

<!--                <v-layout class="main-row main-number">-->
<!--                    <v-flex class="use py-0" xs6>-->
<!--                        {{ nf(useReport.fulfilledCount) }}-->
<!--                    </v-flex>-->

<!--                    <v-flex class="cost py-0" xs3>-->
<!--                        ${{nf(useReport.fulfilledCost)}}-->
<!--                    </v-flex>-->
<!--                    <v-flex class="cost-per-use py-0" sx3>-->
<!--                        ${{ nf(useReport.pricePerPaiduse, true) }}-->
<!--                    </v-flex>-->
<!--                </v-layout>-->


<!--                <v-layout class="mod-row equipped" v-for="mod in useReport.uses.filter(x=>x.isEquipped)">-->
<!--                    <v-flex class="use py-0" xs6>-->
<!--                        <v-layout>-->
<!--                            <v-flex xs4 class="text-xs-left">-->
<!--                                <a v-if="mod.isPaid" @click="setSubscription('free')">-->
<!--                                    -remove-->
<!--                                </a>-->
<!--                            </v-flex>-->
<!--                            <v-flex xs4 class="text-xs-left">{{mod.name}}</v-flex>-->
<!--                            <v-flex xs4>{{ nf(mod.count) }}</v-flex>-->
<!--                        </v-layout>-->
<!--                    </v-flex>-->

<!--                    <v-flex class="cost py-0" xs3>-->
<!--                        ${{nf(mod.price)}}-->
<!--                    </v-flex>-->
<!--                    <v-flex class="cost-per-use py-0" sx3>-->
<!--                        ${{mod.pricePerCount.toFixed(2) }}-->
<!--                    </v-flex>-->
<!--                </v-layout>-->


<!--                <v-layout class="py-2" style=""></v-layout>-->


<!--                <v-layout class="mod-row not-equipped" v-for="mod in useReport.potentialUses">-->

<!--                    <v-flex class="use py-0" xs6>-->
<!--                        <v-layout>-->
<!--                            <v-flex xs4 class="text-xs-left">-->
<!--                                <a @click="setSubscription(mod.name)">+select</a>-->
<!--                            </v-flex>-->
<!--                            <v-flex xs4 class="text-xs-left">{{mod.name}}</v-flex>-->
<!--                            <v-flex xs4>{{ nf(mod.count) }}</v-flex>-->
<!--                        </v-layout>-->
<!--                    </v-flex>-->

<!--                    <v-flex class="cost py-0" xs3>-->
<!--                        ${{nf(mod.price)}}-->
<!--                    </v-flex>-->
<!--                    <v-flex class="cost-per-use py-0" sx3>-->
<!--                        ${{mod.pricePerCount.toFixed(2)}}-->
<!--                    </v-flex>-->
<!--                </v-layout>-->
<!--            </v-flex>-->


<!--            <v-flex class="turnaway-uses py-0" xs2 style="border-left: 1px solid #999;">-->
<!--                <div class="heading">Turnaways</div>-->
<!--                <div class="main-number">-->
<!--                    {{ nf(useReport.getUse('softTurnaway').count + useReport.getUse('hardTurnaway').count) }}-->
<!--                </div>-->
<!--                <div class="under-number">-->
<!--                    {{ nf(useReport.getUse('softTurnaway').count)}} soft-->
<!--                </div>-->
<!--                <div class="under-number">-->
<!--                    {{ nf(useReport.getUse('hardTurnaway').count)}} hard-->
<!--                </div>-->
<!--            </v-flex>-->


        </v-layout>


    </v-container>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import {store} from "../search.js"
    import * as use from "../use.js"

    export default {
        name: "Timeline",
        props: ["journalYears"],
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
            yearlyUses(){
                let ret = use.yearlyUses(this.journalYears)
                return ret
            },
            overallUses(){
                return use.overallUses(this.journalYears)
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