<template>
    <div class="scenario-report"
         v-if="scenario.journalsList">
        <v-container fluid>
            <!--- *testing space  -->
            <v-layout>
<!--                    <pre>-->
<!--                        {{ display.barSegments(scenario.getCostByType())}}-->
<!--                    </pre>-->
            </v-layout>

            <!--- data about the scenario  -->
            <v-layout>
                <v-flex xs4 class="col body-1">
                    <v-layout>
                        <v-flex xs1 class="mr-2">
                            <div style="height: 100%; flex-grow: 1">

                                <downloads-bar
                                        :segments="display.barSegments(scenario.getSubrTable())"></downloads-bar>
                            </div>

                        </v-flex>
                        <v-flex xs11>
                            <div class="body-1">Journals</div>
                            <table class="stats infographic">
                                <tr :key="stat.name"
                                    v-for="stat in display.barSegments(scenario.getSubrTable())"
                                    class="stat"
                                    :style="{color: stat.color}"
                                    :class="{callout: stat.name==='fullSubscription'}">
                                    <td class="num">
                                        {{ nf(stat.count) }}
                                    </td>
                                    <td class="perc">
                                        {{ nf(stat.perc) }}%
                                    </td>
                                    <td>
                                        {{stat.displayName}}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="num">{{nf(scenario.journalsList.length, true)}}</td>
                                    <td>100%</td>
                                    <td>Total journals</td>
                                </tr>


                            </table>

                        </v-flex>
                    </v-layout>
                </v-flex>

                <v-flex xs4 class="col body-1">
                    <div class="body-1">Annual usage</div>
                    <v-layout>
                        <v-flex xs2 class="graphic mr-2">
                            <div style="height: 100%; flex-grow: 1; display:flex;">
                                <div :key="year"
                                     style="height: 50px; flex-grow: 1"
                                     v-for="(usageDict, year) in scenario.getUsageByTypeByYear()">
                                    <downloads-bar :year="year"
                                                   :segments="display.barSegments(usageDict)">
                                    </downloads-bar>
                                </div>
                            </div>
                        </v-flex>


                        <v-flex xs10>
                            <table class="stats infographic">
                                <tr :key="usageType.name"
                                    v-for="usageType in display.barSegments(scenario.getUsageByType())"
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
                                    <td class="num">{{nf(scenario.getAnnualUsageTotal(), true)}}</td>
                                    <td>100%</td>
                                    <td>Total uses</td>
                                </tr>
                            </table>
                        </v-flex>

                    </v-layout>
                </v-flex>


                <v-flex xs4 class="col body-1">
                    <div class="body-1">Costs</div>
                    <v-layout>
                        <v-flex xs2 class="graphic mr-2" style="display:flex;">
                            <div :key="year"
                                 style="height: 50px; flex-grow: 1"
                                 v-for="(costsDict, year) in scenario.getCostByTypeByYear()">
                                <downloads-bar :year="year"
                                               :is-currency="true"
                                               :segments="display.barSegments(costsDict)">
                                </downloads-bar>
                            </div>
                        </v-flex>

                        <v-flex xs10>
                            <table class="stats infographic">
                                <tr :key="stat.name"
                                    v-for="stat in display.barSegments(scenario.getCostByType())"
                                    class="stat"
                                    :style="{color: stat.color}"
                                    :class="{callout: stat.name==='fullSubscription'}">
                                    <td class="num">
                                        {{ currency(stat.count, true) }}
                                    </td>
                                    <td class="perc">
                                        {{ nf(stat.perc) }}%
                                    </td>
                                    <td>
                                        {{stat.displayName}}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="num">{{currency(scenario.getCostTotal(), true)}}</td>
                                    <td>100%</td>
                                    <td>Total cost</td>
                                </tr>
                            </table>
                        </v-flex>

                    </v-layout>
                </v-flex>

            </v-layout>

            <v-layout>
                <table class="pretty">
                    <tr style="font-weight: bold;">
                        <td>Percent</td>
                        <td>{{nf(100* scenario.getCostTotal() / oldScenario.getCostTotal())}}%</td>
                        <td>{{nf(100* scenario.getUsageInstant() / oldScenario.getUsageInstant())}}%</td>
                    </tr>
                    <tr>
                        <td>A-la-carte</td>
                        <td>{{currency(scenario.getCostTotal(), true)}}</td>
                        <td>{{nf(scenario.getUsageInstant())}}</td>
                    </tr>
                    <tr>
                        <td>Big Deal</td>
                        <td>{{currency(oldScenario.getCostTotal(), true)}}</td>
                        <td>{{nf(oldScenario.getUsageInstant())}}</td>
                    </tr>
                </table>


            </v-layout>
            <v-layout>
                <v-flex>
                    <v-btn @click="$emit('subscribe', {instantAccess:null, docdelOnly:false})">Cheapest ILL</v-btn>
                    <v-btn @click="$emit('subscribe',  {instantAccess:null, maxCost:2200000, docdelOnly:false})">Spend $2.2M, no docdel</v-btn>
                </v-flex>
            </v-layout>


        </v-container>
    </div>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import {currency, nFormat} from "../util";
    import * as display from "../display";


    export default {
        name: "ScenarioReport",
        props: ["scenario", "oldScenario"],
        components: {
            DownloadsBar,
        },
        data: () => ({
            display: display,

        }),
        methods: {
            nf: nFormat,
            currency: currency,
        },
        computed: {},
        watchers() {
        }
    }
</script>

<style lang="scss">
    .stats {
        td.num {
            text-align: right;
        }
        td.perc {
            text-align: right;
            padding-right: 5px;
        }
    }

</style>