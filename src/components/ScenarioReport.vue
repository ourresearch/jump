<template>
<div class="scenario-report"
             v-if="scenario.overallSubrPackage">
            <v-container fluid>
                <!--- *testing space  -->

                <!--- data about the scenario  -->
                <v-layout>
                    <v-flex xs4 class="col body-1">
                        <v-layout>
                            <v-flex xs1 class="mr-2">
                                <div style="height: 100%; flex-grow: 1">

                                    <downloads-bar
                                            :segments="scenario.overallSubrPackage.getSubrStats()"></downloads-bar>
                                </div>

                            </v-flex>
                            <v-flex xs11>
                                <div class="body-1">Journals</div>
                                <table class="stats infographic">
                                    <tr :key="stat.name"
                                        v-for="stat in scenario.overallSubrPackage.getSubrStats()"
                                        class="stat"
                                        :style="{color: stat.color}"
                                        :class="{callout: stat.name==='fullSubscription'}">
                                        <td class="num">
                                            {{ nf(stat.count) }}
                                        </td>
                                        <td>
                                            {{stat.displayName}}
                                        </td>
                                    </tr>


                                </table>

                            </v-flex>
                        </v-layout>
                    </v-flex>

                    <v-flex xs4 class="col body-1">
                        <div class="body-1">Usage</div>
                        <v-layout>
                            <v-flex xs2 style="display:flex;">
                                <div :key="subrPackage.year"
                                     style="height: 50px; flex-grow: 1"
                                     v-for="subrPackage in scenario.yearlySubrPackages">
                                    <downloads-bar :year="subrPackage.year"
                                                   :segments="subrPackage.getUsageStats()">
                                    </downloads-bar>
                                </div>
                            </v-flex>


                            <v-flex xs10>
                                <table class="stats infographic">
                                    <tr :key="usageType.name"
                                        v-for="usageType in scenario.overallSubrPackage.getUsageStats()"
                                        v-if="true"
                                        class="stat"
                                        :style="{color: usageType.color}"
                                        :class="{callout: usageType.name==='fullSubscription'}">
                                        <td class="num">
                                            {{ nf(usageType.count) }}
                                        </td>
                                        <td>
                                            {{usageType.displayName}}
                                        </td>
                                    </tr>
                                </table>
                            </v-flex>

                        </v-layout>
                    </v-flex>


                    <v-flex xs4 class="col body-1">
                        <div class="body-1">Costs</div>
                        <v-layout>
                            <v-flex xs2 style="display:flex;">
                                <div :key="subrPackage.year"
                                     style="height: 50px; flex-grow: 1"
                                     v-for="subrPackage in scenario.yearlySubrPackages">
                                    <downloads-bar :year="subrPackage.year"
                                                   :is-currency="true"
                                                   :segments="subrPackage.getCostStats()">
                                    </downloads-bar>
                                </div>
                            </v-flex>
                            <v-flex xs10>
                                <table class="stats infographic">
                                    <tr :key="stat.name"
                                        v-for="stat in scenario.overallSubrPackage.getCostStats()"
                                        class="stat"
                                        :style="{color: stat.color}"
                                        :class="{callout: stat.name==='fullSubscription'}">
                                        <td class="num">
                                            {{ currency(stat.count, true) }}
                                        </td>
                                        <td>
                                            {{stat.displayName}}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="num">{{currency(scenario.overallSubrPackage.cost, true)}}</td>
                                        <td>Total</td>
                                    </tr>
                                </table>
                            </v-flex>

                        </v-layout>
                    </v-flex>

                </v-layout>
            </v-container>
        </div>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import {currency, nFormat} from "../util";

    export default {
        name: "ScenarioReport",
        props: ["scenario", "oldScenario"],
        components: {
            DownloadsBar,
        },
        data: () => ({

        }),
        methods: {
            nf: nFormat,
            currency: currency,
        },
        computed: {
        },
        watchers(){
        }
    }
</script>

<style scoped>

</style>