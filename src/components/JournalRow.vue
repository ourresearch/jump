<template>
    <v-container v-if="data" grid-list-sm fluid class="journal pa-0">


        <!-- journal META section -->
        <v-layout class="top-row" align-content-center align-center>
            <v-flex xs1 class="col">
                <div>
                    <div class="upper title">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <div v-on="on">
                                    {{Math.round(data.getTotalDownloads()).toLocaleString()}}
                                </div>
                            </template>
                            <span>
                                Total annual downloads
                            </span>
                        </v-tooltip>
                    </div>
                    <div class="lower">.</div>

                </div>

            </v-flex>
            <v-flex style="max-width: 80px;" class="mx-4">
                <div v-if="!data.getTotalDownloads()"
                     style="display:flex;align-content:center; justify-content: center; opacity: .5;">
                    No usage
                </div>
                <div style="height: 100%; flex-grow: 1; display:flex;" v-if="data.getTotalDownloads() > 0">
                    <div :key="year"
                         style="height: 50px; flex-grow: 1"
                         v-for="(usageDict, year) in data.getSubr().getUsageByTypeByYear()">
                        <downloads-bar :year="year"
                                       :segments="display.barSegments(usageDict)">
                        </downloads-bar>
                    </div>
                </div>

            </v-flex>


            <v-flex xs4 class="col">
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

            <v-flex xs2 class="col cost numbers">
                <div :class="{isFullSubr:false }">
<!--                    <div v-if="data.isOverpaid()" class="alert" style="color:darkred;">-->
<!--                        Overpaying!-->
<!--                    </div>-->
                    <div class="title upper">
                        {{ currency(data.getFullSubrCostAboveIll(), true) }}
                    </div>
                    <div class="lower">
                        {{ currency(data.getSubscriptionRealCPU())}}
                    </div>
                </div>
            </v-flex>


            <v-flex v-if="false" class="subr fulfillment">
                <div @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: 'fullSubscription'})"
                     class="subr full"
                     :style="{color: display.color('fullSubscription')}"
                     :class="{selected: data.getSubr().name==='fullSubscription'}">
                    <div class="upper">{{currency(data.getAdjSubrCPU())}}</div>
                    <div class="lower">+{{ currency(data.getAdjSubrCost()) }}</div>
                </div>

            </v-flex>

            <v-flex v-if="false" class="item-level fulfillment">
                <div>
                    <div @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: 'ill'})"
                         class="subr ill"
                         :style="{color: display.color('ill')}"
                         :class="{selected: data.getSubr().name==='ill'}">
                        <span class="num">{{currency(data.getIllCost(), true)}}</span>
                        <span class="word">base (ILL)</span>
                    </div>
                    <div @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: 'docdel'})"
                         class="subr docdel"
                         :style="{color: display.color('docdel')}"
                         :class="{selected: data.getSubr().name==='docdel'}">
                        <span class="num">+{{ currency(data.getDocdelCost(), true) }}</span>
                        <span class="word">DocDel</span>
                    </div>
                </div>

            </v-flex>
            <v-flex grow></v-flex>
            <v-flex>
                <div>
                    <v-btn class="expand-button"
                           small
                           flat
                           @click="data.isExpanded=true"
                           v-if="!data.isExpanded">
                        expand
                    </v-btn>
                    <v-btn class="shrink-button"
                           small
                           flat
                           @click="data.isExpanded=false"
                           v-if="data.isExpanded">
                        ensmallen
                    </v-btn>
                </div>
            </v-flex>
        </v-layout>


        <!-- expanded section! -->
        <v-layout v-if="data.isExpanded" class="pt-5">
            <v-flex>
                <table class="pretty usage-metrics">
                    <tr>
                        <th>usage metric</th>
                        <th>count</th>
                        <th>contribution</th>
                    </tr>
                    <tr>
                        <td>COUNTER downloads</td>
                        <td>{{data.getAnnualRawDownloadsTotal()}}</td>
                        <td>
                            {{data.getAnnualRawDownloadsTotal()}}
                            <span class="contrib body-1">(1x)</span>
                        </td>
                    </tr>
                    <tr>
                        <td>institutional citations</td>
                        <td>{{data.citations}}</td>
                        <td>
                            {{data.citations * data.userSettings.downloadsPerCitation}}
                            <span class="contrib body-1">({{data.userSettings.downloadsPerCitation}}x)</span>
                        </td>
                    </tr>
                    <tr>
                        <td>institutional authorships</td>
                        <td>{{data.authorships}}</td>
                        <td>
                            {{data.authorships * data.userSettings.downloadsPerAuthorship}}
                            <span class="contrib body-1">({{ data.userSettings.downloadsPerAuthorship }}x)</span>
                        </td>
                    </tr>
                    <tr>
                        <td>weighted usage (total)</td>
                        <td></td>
                        <td>
                            {{data.getTotalDownloads().toLocaleString()}}
                            <span class="contrib"></span>
                        </td>
                    </tr>
                </table>
            </v-flex>
            <v-flex shrink class="subr-usage-options">
                <v-layout row>
                    <v-flex>
                        <div class="subr-col">
                            <div class="name">.</div>
                            <div :key="usageType.name"
                                 :style="{color: usageType.color}"
                                 v-for="usageType in display.barSegmentLabels()">
                                {{ usageType.displayName }}
                            </div>
                        </div>
                    </v-flex>
                    <v-flex :key="name"
                            v-for="(timeline, name) in data.timelines">
                        <div class="subr-col" :class="{selected: name===data.getSubr().name}">
                            <div class="name">{{ display.displayName(timeline.name) }}</div>
                            <div :key="usageType.name"
                                 :style="{color: usageType.color}"
                                 v-for="usageType in display.barSegments(timeline.getAnnualUsageByType())">
                                <span class="num" v-if="usageType.perc !== 0">
                                    {{ nf(usageType.perc) }}%
                                </span>
                                <span v-if="usageType.perc==0">
                                    -
                                </span>

                            </div>
                        </div>
                    </v-flex>
                </v-layout>
            </v-flex>
            <v-flex grow></v-flex>


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
            },



        },
        computed: {},
        watchers() {
        }
    }
</script>

<style scoped lang="scss">
    .journal {
        .expand-button {
            display: none;
        }

        .top-row:hover {
            background: #f2f2f2;

            .expand-button {
                display: block;
            }
        }

    }


    table.usage-metrics {
        td, th {
            max-width: 7em;
            line-height: 1;
            padding: 5px;
        }

        span.contrib {
            display: none;
        }
    }

    .subr-usage-options {
        text-align: right;

        .subr-col {
            padding: 5px;
            margin: 5px;

            &.selected {
                border: 1px solid #999;
            }
        }
    }

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
        padding: 5px 10px;
        /*border-radius: 5px;*/
        /*border: 1px solid transparent;*/
        font-weight: 300;
        margin-right: 1px;
        border-bottom: 5px solid;


        &.selected {
            font-weight: bold;
        }

    }


</style>