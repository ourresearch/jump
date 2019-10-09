<template>
    <v-container grid-list-sm fluid class="journal pa-0">


        <!-- journal META section -->
        <v-layout align-content-center align-center>


            <v-flex xs3 class="col">
                <div>
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
                            Annual citations from UVA faculty
                        </span>
                </v-tooltip>
            </v-flex>

            <v-flex xs1 class="impact usage numbers col">
                <div>
                    <div class="upper">
                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <div v-on="on">
                                    {{Math.round(data.getAdjUse() / 5).toLocaleString()}}
                                </div>
                            </template>
                            <span>
                                Annual paid usage
                            </span>
                        </v-tooltip>
                    </div>
                    <div class="lower body-1">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <div v-on="on">
                                    {{Math.round(data.getTotalDownloads() / 5).toLocaleString()}}
                                </div>
                            </template>
                            <span>
                                Total annual downloads
                            </span>
                        </v-tooltip>
                    </div>
                </div>
            </v-flex>
            <v-flex style="max-width: 80px;" class="mx-4">
                <div style="height: 100%; flex-grow: 1; display:flex;">
                    <div :key="year"
                         style="height: 50px; flex-grow: 1"
                         v-for="(usageDict, year) in data.selectedTimeline.getUsageByTypeByYear()">
                        <downloads-bar :year="year"
                                       :segments="display.barSegments(usageDict)">
                        </downloads-bar>
                    </div>
                </div>

            </v-flex>
            <v-flex class="subr fulfillment">
                <div @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: 'fullSubscription'})"
                     class="subr full"
                     :style="{color: display.color('fullSubscription')}"
                     :class="{selected: data.selectedTimeline.name==='fullSubscription'}">
                    <div class="upper">{{currency(data.getAdjSubrCPU())}}</div>
                    <div class="lower">+{{ currency(data.getAdjSubrCost() / 5) }}</div>
                </div>

            </v-flex>

            <v-flex class="item-level fulfillment">
                <div>
                    <div @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: 'ill'})"
                         class="subr ill"
                         :style="{color: display.color('ill')}"
                         :class="{selected: data.selectedTimeline.name==='ill'}">
                        <span class="num">{{currency(data.getIllCost() / 5, true)}}</span>
                        <span class="word">base (ILL)</span>
                    </div>
                    <div @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: 'docdel'})"
                         class="subr docdel"
                         :style="{color: display.color('docdel')}"
                         :class="{selected: data.selectedTimeline.name==='docdel'}">
                        <span class="num">+{{ currency(data.getDocdelCost() / 5, true) }}</span>
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
    import * as display from "../display";


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
        data: () => ({
            display: display,
        }),
        methods: {
            currency: currency,
            nf: nFormat,
            setSubscription: function (newSubscription) {
                console.log("setting subscription!", newSubscription)
            }

        },
        computed: {
        },
        watchers() {
        }
    }
</script>

<style scoped lang="scss">

    .subr {
        cursor: pointer;

        &.selected {
            font-weight: bold;
        }

        .num {
            padding-right: 5px;
            text-align: right;
            width: 10em;
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