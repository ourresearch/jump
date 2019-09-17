<template>
    <v-container class="timeline pa-2">
<!--        <v-layout>-->
<!--            <v-flex><pre>{{ (subscription) }}</pre></v-flex>-->
<!--        </v-layout>-->

        <v-layout align-items-top class="text-xs-right">
            <v-flex class="fulfillment-graph text-xs-left" xs1>
                <div style="display: flex; width:100%; height: 40%;">
                    <downloads-bar :mods="subscription" class="pr-1" style="flex-grow:3;"></downloads-bar>
                    <downloads-bar v-for="yearSubscription in yearlySubscription" :year="yearSubscription.year" :mods="yearSubscription.mods"></downloads-bar>

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
                        {{ nf(fulfilledCount) }}
                    </v-flex>

                    <v-flex class="cost py-0" xs3>
                        ${{nf(fulfilledCost)}}
                    </v-flex>
                    <v-flex class="cost-per-use py-0" sx3>
                        ${{ nf(pricePerPaiduse, true) }}
                    </v-flex>
                </v-layout>



                <v-layout class="mod-row equipped" v-for="mod in subscription.filter(x=>x.isEquipped)">
                    <v-flex class="use py-0" xs6>
                        <v-layout>
                            <v-flex xs4 class="text-xs-left">
                                <a v-if="mod.isPaid" @click="subscriptionName='free'">
                                    -remove
                                </a>
                            </v-flex>
                            <v-flex xs4 class="text-xs-left">{{mod.name}}</v-flex>
                            <v-flex xs4>{{ nf(mod.count) }}</v-flex>
                        </v-layout>
                    </v-flex>

                    <v-flex class="cost py-0" xs3>
                        ${{nf(mod.price)}}
                    </v-flex>
                    <v-flex class="cost-per-use py-0" sx3>
                        ${{mod.pricePerCount.toFixed(2) }}
                    </v-flex>
                </v-layout>



                <v-layout class="py-2" style="border-bottom: 1px solid #ccc;"></v-layout>


                <v-layout class="mod-row not-equipped" v-if="mod.name !== subscriptionName" v-for="mod in hypotheticalPaidMods">

                    <v-flex class="use py-0" xs6>
                        <v-layout>
                            <v-flex xs4 class="text-xs-left">
                                <a @click="subscriptionName=mod.name">+select</a>
                            </v-flex>
                            <v-flex xs4 class="text-xs-left">{{mod.name}}</v-flex>
                            <v-flex xs4>{{ nf(mod.count) }}</v-flex>
                        </v-layout>
                    </v-flex>

                    <v-flex class="cost py-0" xs3>
                        ${{nf(mod.price)}}
                    </v-flex>
                    <v-flex class="cost-per-use py-0" sx3>
                        ${{mod.pricePerCount.toFixed(2)}}
                    </v-flex>
                </v-layout>
            </v-flex>



            <v-flex class="turnaway-uses py-0" xs2 style="border-left: 1px solid #999;">
                <div class="heading">Turnaways</div>
                <div class="main-number">
                    {{ nf(softTurnaway.count + hardTurnaway.count) }}
                </div>
                <div class="under-number">
                    {{ nf(softTurnaway.count)}} soft
                </div>
                <div class="under-number">
                    {{ nf(hardTurnaway.count)}} hard
                </div>
            </v-flex>



        </v-layout>


    </v-container>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import {store} from "../search.js"

    export default {
        name: "Timeline",
        props: ["stats"],
        components: {
            DownloadsBar
        },
        data: () => ({
            store: store,
            subscriptionName: "free"
        }),
        methods: {
            currency(num) {
                let round = Math.round(num * 100) / 100
                return "$" + round.toLocaleString()
            },
            modNum(name, k){
                    store.getModNum(this._overallStats, this.subscriptionName, name, k)
            },
            nf: store.nFormat

        },
        computed: {
            _overallStats(){
                return this.stats.reduce(store.sumObjects)
            },
            fulfilledCount(){
                return this.subscription
                    .filter(x=>x.isFulfillment)
                    .map(x=>x.count)
                    .reduce((a,b)=>a+b)
            },
            fulfilledCost(){
                return this.subscription
                    .filter(x=>x.isFulfillment)
                    .map(x=>x.price)
                    .reduce((a,b)=>a+b, 0)
            },
            pricePerPaiduse(){
                let paidUses = this.subscription
                    .filter(x=>x.price > 0)
                    .map(x=>x.count)
                    .reduce((a,b)=>a+b, 0)

                return this.fulfilledCost / paidUses
            },
            subscription(){
                return store.makeMods(this._overallStats, this.subscriptionName)
            },
            hypotheticalPaidMods() {
                return this.store.makeHypotheticalPaidMods(this._overallStats)
            },
            yearlySubscription(){
                let ret = this.stats.map(yearStat => {
                    return {
                        year: yearStat.year,
                        mods: store.makeMods(yearStat, this.subscriptionName)
                    }
                })
                console.log("yearly subscriptions", ret[0])
                return ret
            },
            softTurnaway(){
                return this.subscription.filter(x=>x.name==="softTurnaway")[0]
            },
            hardTurnaway(){
                return this.subscription.filter(x=>x.name==="hardTurnaway")[0]
            },
            modCart(){
                let docdel = store.makeMods(this._overallStats, "docdel").filter(x=>x.name=="docdel")[0];
                let fullSubscription = store.makeMods(this._overallStats, "fullSubscription").filter(x=>x.name=="fullSubscription")[0];


                return [
                    docdel,
                    fullSubscription
                ]



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