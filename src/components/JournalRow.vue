<template>
    <v-container class="journal pa-2">

        <v-layout align-items-top>
            <v-flex shrink>
                <v-checkbox class="pa-0 mt-1"></v-checkbox>
            </v-flex>

            <v-flex grow>

                <!-- journal META section -->
                <v-layout>
                    <v-flex>
                        <div>
                            <div class="name headline">
                                {{data.meta.title}}
                                <span class="body-1">({{data.subscriptions.selected.name}})</span>
                            </div>
                            <div>best cppa: {{data.sortKeys.bestCostPerPaidUse}}</div>
                            <div class="topic body-1">
                                {{data.meta.issnl}}
                                {{ data.meta.subject}}
                            </div>

                        </div>
                    </v-flex>
                </v-layout>

                <!-- journal USAGE section -->
                <v-layout>
                    <v-flex xs6>
                        <usage-table :subscription="data.subscriptions.selected.overall"></usage-table>

                    </v-flex>
                </v-layout>


                <!-- journal SUBSCRIPTION section -->
                <div class="pa-2 mt-2">
                    <v-layout>
                        <h3 class="subheading">Subscriptions</h3>
                    </v-layout>
                    <v-layout v-for="stat in data.subscriptions.possible.overallUsageStats">
                        <v-flex xs3>
                            <span @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: stat.name})">
                                subscribe
                            </span>
                        </v-flex>
                        <v-flex>
                            <usage-type-row
                                    :name="stat.name"
                                    :count="stat.count"
                                    :cost="stat.cost"
                                    :cost-per-paid-use="stat.costPerCount"
                            ></usage-type-row>
                        </v-flex>


<!--                        <v-flex xs3 class="mx-2" style="cursor:pointer;"-->
<!--                                @click="subscribe(data.meta.issnl, useType.name)">-->
<!--                                            <span>-->
<!--                                                <i class="far fa-circle"-->
<!--                                                   v-if="!hasSubscription(data.meta.issnl, useType.name)"></i>-->
<!--                                                <i class="fas fa-check-circle"-->
<!--                                                   v-if="hasSubscription(data.meta.issnl, useType.name)"></i>-->
<!--                                            </span>-->

<!--                            {{useType.name}}-->
<!--                        </v-flex>-->
<!--                        <v-flex xs1 class="mx-2">-->
<!--                            {{nf(useType.count)}}-->
<!--                        </v-flex>-->
<!--                        <v-flex xs1 v-if="useType.cost" class="mx-2">-->
<!--                            {{currency(useType.cost, true)}}-->
<!--                        </v-flex>-->
<!--                        <v-flex xs1 v-if="useType.costPerCount" class="px-2">-->
<!--                            {{currency(useType.costPerCount)}}-->
<!--                        </v-flex>-->
                    </v-layout>
<!--                    <v-layout>-->
<!--                        <v-flex xs3 class="mx-2" style="cursor:pointer;" @click="subscribe(data.meta.issnl, 'free')">-->
<!--                                            <span style="cursor:pointer;" @click="subscribe('free')">-->
<!--                                                <i class="far fa-circle"-->
<!--                                                   v-if="!hasSubscription(data.meta.issnl, 'free')"></i>-->
<!--                                                <i class="fas fa-check-circle"-->
<!--                                                   v-if="hasSubscription(data.meta.issnl, 'free')"></i>-->
<!--                                            </span>-->
<!--                            Free-->
<!--                        </v-flex>-->
<!--                    </v-layout>-->

                </div>

            </v-flex>

        </v-layout>


    </v-container>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import UsageTable from "../components/UsageTable"
    import UsageTypeRow from "../components/UsageTypeRow"

    import {currency, nFormat} from "../util";

    export default {
        name: "JournalRow",
        props: ["data"],
        components: {
            DownloadsBar,
            UsageTable,
            UsageTypeRow
        },
        data: () => ({}),
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


</style>