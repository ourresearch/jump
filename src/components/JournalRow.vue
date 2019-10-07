<template>
    <v-container grid-list-sm fluid class="journal pa-0">


        <!-- journal META section -->
        <v-layout align-content-center align-center>

            <!--            <v-flex shrink class="pa-1" style="align-self: stretch;">-->
            <!--                <downloads-chart-->
            <!--                        :yearly-subscriptions="yearlySubscriptions"></downloads-chart>-->
            <!--            </v-flex>-->

            <v-flex xs3 class="col">
                <div>
                    <!--                    <div class="body-1">{{currency(data.sortKeys.subrCpua)}}</div>-->
                    <div class="name title upper">
                        {{data.meta.title}}
                    </div>
                    <div class="topic body-1 lower">
                        <!--                                {{data.meta.issnl}}-->
                        {{ data.meta.subject}}
                    </div>
                </div>
            </v-flex>


            <v-flex xs1 class="impact citations numbers col">
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <div v-on="on">
                            {{data.citations.toLocaleString()}}
                            <i class="fas fa-pencil-alt light"></i>
                        </div>
                    </template>
                    <span>
                            2018 citations from MIT faculty
                        </span>
                </v-tooltip>
            </v-flex>

            <v-flex xs1 class="impact usage numbers col">
                <div>
                    <div class="upper">
                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <div v-on="on">
                                    {{data.getAdjUse().toLocaleString()}}
                                </div>
                            </template>
                            <span>
                                projected 5yr usage (Adj)
                            </span>
                        </v-tooltip>
                    </div>
                    <div class="lower body-1">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <div v-on="on">
                                    {{nf(data.getTotalDownloads())}}
                                </div>
                            </template>
                            <span>
                                Total downloads
                            </span>
                        </v-tooltip>
                    </div>
                </div>
            </v-flex>
            <v-flex shrink class="mx-4" style="display:flex; align-self: stretch; ">
                    <div :key="subrYear.year"
                         style="width: 10px;"
                         v-for="subrYear in yearlySubscriptions">
                        <downloads-bar :year="subrYear.year"
                                       :segments="subrYear.getUsageStats()">
                        </downloads-bar>
                    </div>
            </v-flex>
            <v-flex class="subr fulfillment">
                <div @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: 'fullSubscription'})"
                     class="subr full"
                     :style="{color: data.timelines.fullSubscription.getColor()}"
                     :class="{selected: data.selectedTimeline.name==='fullSubscription'}">
                    <div class="upper">{{currency(data.getAdjSubrCPU())}}</div>
                    <div class="lower">{{ currency(data.getAdjSubrCost()) }}</div>
                </div>

            </v-flex>

            <v-flex class="item-level fulfillment">
                <div>
                    <div @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: 'ill'})"
                         class="subr ill"
                         :style="{color: data.timelines.ill.getColor()}"
                         :class="{selected: data.selectedTimeline.name==='ill'}">
                        <span class="num">{{currency(data.getIllCost(), true)}}</span>
                        <span class="word">ILL</span>
                    </div>
                    <div @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: 'docdel'})"
                         class="subr docdel"
                         :style="{color: data.timelines.docdel.getColor()}"
                         :class="{selected: data.selectedTimeline.name==='docdel'}">
                        <span class="num">+{{ currency(data.getDocdelCost(), true) }}</span>
                        <span class="word">DocDel</span>
                    </div>
                </div>

            </v-flex>
        </v-layout>


    </v-container>
</template>

<script>
    import UsageTable from "../components/UsageTable"
    import UsageTableRow from "../components/UsageTableRow"
    import DownloadsBar from "../components/DownloadsBar"
    import FulfillmentIcon from "../components/FullfillmentIcon"

    import {currency, nFormat} from "../util";

    export default {
        name: "JournalRow",
        props: ["data", "hideDocdel"],
        components: {
            UsageTable,
            UsageTableRow,
            DownloadsBar,
            FulfillmentIcon
        },
        data: () => ({}),
        methods: {
            currency: currency,
            nf: nFormat,
            setSubscription: function (newSubscription) {
                console.log("setting subscription!", newSubscription)
            }

        },
        computed: {
            altSubrs() {
                return this.data.getAltSubrs()
            },
            yearlySubscriptions() {
                return this.data.getYearlySubscriptions()
            },
        },
        watchers() {
        }
    }
</script>

<style scoped lang="scss">

    .subr {
        cursor:pointer;
        &.selected {
            font-weight: bold;
        }
        .num {
            padding-right: 5px;
            text-align: right;
            width:10em;
            display: inline-block;
        }
        text-align: right;
        .word {
            width: 10em;
            display: inline-block;
            text-align: left;
        }
    }

    .numbers {
        text-align: right;

        i.light {
            opacity: .8;
            font-size: 10px;
        }
    }

    .flex.col {
        padding: 5px 10px !important;
    }

    .subscription-item {
        cursor: pointer;
        padding: 5px 10px;
        /*border-radius: 5px;*/
        /*border: 1px solid transparent;*/
        font-weight: 300;
        margin-right: 1px;
        border-bottom: 5px solid;


        &:hover {
            background: #f2f2f2;
        }

        &.selected {
            font-weight: bold;
        }

    }


</style>