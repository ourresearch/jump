<template>
    <div class="scenario-report"
         v-if="scenario.journals.length">
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
                                    <td class="num">{{nf(scenario.journals.length, true)}}</td>
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
                                    <td>Total usage</td>
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

            <v-layout class="quadrants py-5">
                <v-flex>
                    <v-layout class="top labels"></v-layout>
                    <v-layout class="square">
                        <div style="height: 300px; width: 400px;">
                            <div class="top-row row"
                                 style="display:flex;"
                                 :style="{height: quads.instant.height+'%'}">

                                <div class="row-label">
                                    <div class="percent">{{nf(quads.instant.height)}}%</div>
                                    <div class="num">{{scenario.getUsageInstant().toLocaleString()}}</div>
                                    <div class="label">Instant uses</div>
                                </div>
                                <div class="quad"
                                     style="height:100%;"
                                     :style="{width: quads.instant.free.width+'%', background: quads.instant.free.color}"></div>
                                <div class="quad"
                                     style="height:100%; margin-left: 5px;"
                                     :style="{width: quads.instant.paid.width+'%', background: quads.instant.paid.color}"></div>

                            </div>
                            <div class="bottom-row row"
                                 style="display:flex; border-top: 10px solid transparent;"
                                 :style="{height: quads.delayed.height+'%'}">

                                <div class="row-label bottom-right">
                                    <div class="percent">{{nf(quads.delayed.height)}}%</div>
                                    <div class="num">{{scenario.getUsageDelayed().toLocaleString()}}</div>
                                    <div class="label">Delayed uses</div>
                                </div>

                                <div class="quad"
                                     style="height:100%; margin-right: 5px;"
                                     :style="{width: quads.delayed.free.width+'%', background: quads.delayed.free.color}"></div>


                                <div class="quad"
                                     style="height:100%"
                                     :style="{width: quads.delayed.paid.width+'%', background: quads.delayed.paid.color}"></div>

                            </div>
                        </div>
                    </v-layout>
                </v-flex>
                <v-flex class="controls">
                    <div>
                        <div>
                            $<input v-model.lazy="userBudget"
                                    type="text" class="budget">
                            <v-btn flat primary
                                   @click="$emit('subscribe',  {instantAccess:null, maxCost:userBudget.replace(/,/gi, ''), docdelOnly:false})">
                                Simulate
                            </v-btn>
                            <v-btn icon @click="$emit('subscribe', {instantAccess:null, docdelOnly:false})"><i
                                    class="fas fa-magic"></i></v-btn>

                        </div>
                        <div>
                            <strong>

                                {{nf(100* scenario.getCostTotal() / oldScenario.getCostTotal())}}%
                            </strong>
                            of Big Deal price
                        </div>

                    </div>


                </v-flex>
            </v-layout>


            <!--            <v-layout>-->
            <!--                <table class="pretty">-->
            <!--                    <tr style="font-weight: bold;">-->
            <!--                        <td>Percent</td>-->
            <!--                        <td>{{nf(100* scenario.getCostTotal() / oldScenario.getCostTotal())}}%</td>-->
            <!--                        <td>{{nf(100* scenario.getUsageInstant() / oldScenario.getUsageInstant())}}%</td>-->
            <!--                    </tr>-->
            <!--                    <tr>-->
            <!--                        <td>A-la-carte</td>-->
            <!--                        <td>{{currency(scenario.getCostTotal(), true)}}</td>-->
            <!--                        <td>{{nf(scenario.getUsageInstant())}}</td>-->
            <!--                    </tr>-->
            <!--                    <tr>-->
            <!--                        <td>Big Deal</td>-->
            <!--                        <td>{{currency(oldScenario.getCostTotal(), true)}}</td>-->
            <!--                        <td>{{nf(oldScenario.getUsageInstant())}}</td>-->
            <!--                    </tr>-->
            <!--                </table>-->


            <!--            </v-layout>-->
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
            userBudget: "0",

        }),
        methods: {
            nf: nFormat,
            currency: currency,
        },
        computed: {
            scenarioCost() {
                return this.scenario.getCostTotal()
            },
            quads() {
                return {
                    instant: {
                        height: this.scenario.getPercInstantAccess(),
                        free: {
                            color: display.color("oa"),
                            name: "Free Instant",
                            width: 100 * this.scenario.getUsageFreeInstant() / this.scenario.getUsageInstant()
                        },
                        paid: {
                            color: display.color("fullSubscription"),
                            name: "Subscription",
                            width: 100 * this.scenario.getUsagePaidInstant() / this.scenario.getUsageInstant()
                        }
                    },
                    delayed: {
                        height: 100 - this.scenario.getPercInstantAccess(),
                        free: {
                            color: display.color("softTurnaway"),
                            name: "Free Delayed",
                            width: 100 * this.scenario.userSettings.hardTurnawayProp,

                        },
                        paid: {
                            color: display.color("ill"),
                            name: "ILL",
                            width: 100 * (1 - this.scenario.userSettings.hardTurnawayProp),

                        }
                    },
                }
            }
        },
        mounted() {
            this.userBudget = this.nf(this.scenario.getCostTotal()).toLocaleString()
        },
        watch: {
            scenarioCost: function (newVal) {
                this.userBudget = this.nf(newVal).toLocaleString()

            },
            userBudget: function (newValue) {
                const result = newValue.replace(/\D/g, "")
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                this.$nextTick(() => this.userBudget = result);
            }
        }
    }
</script>

<style lang="scss">
    input.budget {
        font-size: 24px;
        background: #fff;
        border: 3px solid #ccc;
        width: 6em;
    }

    .square {
        .row {
            position: relative;

            .row-label {
                position: absolute;
                line-height: 1;
                bottom: 0;
                right: 0;
                width: 120px;
                text-align: left;
                margin-right: -120px;
                padding-left: 10px;

                .percent {
                    font-size: 42px;
                }

                &.bottom-right {
                    top: 0;
                    bottom: auto;
                    border-top: 1px solid #333;
                    padding-top: 5px;
                    margin-top: -5px;
                }
            }


        }

    }


    .scenario-report {
        background: #ddd;
    }

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