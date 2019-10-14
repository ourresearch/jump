<template>
    <v-container v-if="data" grid-list-sm fluid class="journal pa-0">


        <!-- journal META section -->
        <v-layout class="top-row" @click="data.isExpanded=!data.isExpanded" align-content-center align-center>
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
                <div :style="{color: display.color(data.getSubr().name)}">
                    <div v-if="data.isOverpaid()" class="alert" style="color:darkred;">
                        Overpaying!
                    </div>
                    <div class="title upper">
                        {{ currency(data.getSubr().getCostTotal()) }}
                    </div>
                    <div class="lower">
                        {{ currency(data.getSubr().getCostPerNegotiableUse())}}
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
        </v-layout>


        <!-- expanded section! -->
        <v-layout v-if="data.isExpanded">
            <v-flex>
                <table class="pretty usage-metrics">
                    <tr>
                        <th>usage metric</th>
                        <th>count</th>
                        <th>multiplier</th>
                        <th>contribution</th>
                    </tr>
                    <tr>
                        <td>COUNTER downloads</td>
                        <td>{{data.getAnnualRawDownloadsTotal()}}</td>
                        <td>1x</td>
                        <td>{{data.getAnnualRawDownloadsTotal()}}</td>
                    </tr>
                    <tr>
                        <td>institutional citations</td>
                        <td>{{data.citations}}</td>
                        <td>{{ data.userSettings.downloadsPerCitation }}x</td>
                        <td>{{data.citations * data.userSettings.downloadsPerCitation}}</td>
                    </tr>
                    <tr>
                        <td>institutional authorships</td>
                        <td>{{data.authorships}}</td>
                        <td>{{ data.userSettings.downloadsPerAuthorship }}x</td>
                        <td>{{data.authorships * data.userSettings.downloadsPerAuthorship}}</td>
                    </tr>
                    <tr>
                        <td>weighted usage (total)</td>
                        <td></td>
                        <td></td>
                        <td>{{data.getTotalDownloads().toLocaleString()}}</td>
                    </tr>
                </table>
            </v-flex>
            <v-flex>
                <table class="stats infographic">
                    <tr :key="usageType.name"
                        v-for="usageType in display.barSegments(data.getSubr().getAnnualUsageByType())"
                        v-if="true"
                        class="stat"
                        :style="{color: usageType.color}"
                        :class="{callout: usageType.name==='fullSubscription'}">
                        <td class="num">
                            {{ nf(usageType.count) }}
                        </td>
                        <td class="perc">
                            {{ nf(usageType.perc) }}%
                        </td>
                        <td>
                            {{usageType.displayName}}
                        </td>
                    </tr>
                    <tr>
                        <td class="num">{{nf(data.getSubr().getAnnualUsageTotal(), true)}}</td>
                        <td>100%</td>
                        <td>Total usage</td>
                    </tr>
                </table>
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
        computed: {},
        watchers() {
        }
    }
</script>

<style scoped lang="scss">
    table.usage-metrics {
        td, th {
            max-width: 7em;
            line-height: 1;
            padding: 5px;
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