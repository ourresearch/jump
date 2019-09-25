<template>
    <v-container class="journal py-5">

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
                            <div class="topic body-1">
                                {{data.meta.issnl}}
                                {{ data.meta.subject}}
                            </div>

                        </div>
                    </v-flex>
                </v-layout>

                <!-- journal USAGE section -->
                <v-layout>
                    <v-flex shrink class="pr-2">
                        <downloads-chart
                                :yearly-subscriptions="data.subscriptions.selected.byYear"></downloads-chart>
                    </v-flex>


                    <v-flex xs6>
                        <usage-table :subscription="data.subscriptions.selected.overall"></usage-table>

                    </v-flex>
                </v-layout>


                <!-- journal SUBSCRIPTION section -->
                <v-layout class="pa-2 mt-2">
                    <v-flex xs6>
                        <v-layout>
                            <h3 class="subheading">Subscriptions</h3>
                        </v-layout>
                        <v-layout
                                class="subscription-row"
                                :class="{selected: stat.name === data.subscriptions.selected.name}"
                                 @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: stat.name})"
                                v-for="stat in data.subscriptions.possible.overallUsageStats">
                            <v-flex shrink>
                                <span>
                                    <i v-if="stat.name !== data.subscriptions.selected.name" class="far fa-circle"></i>
                                    <i v-if="stat.name === data.subscriptions.selected.name" class="fas fa-check-circle"></i>
                                </span>
                            </v-flex>
                            <v-flex>
                                <usage-table-row
                                        :name="stat.name"
                                        :count="stat.count"
                                        :cost="stat.cost"
                                        :cost-per-paid-use="stat.costPerCount"
                                ></usage-table-row>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex xs6></v-flex>

                </v-layout>

            </v-flex>

        </v-layout>


    </v-container>
</template>

<script>
    import UsageTable from "../components/UsageTable"
    import UsageTableRow from "../components/UsageTableRow"
    import DownloadsChart from "../components/DownloadsChart"

    import {currency, nFormat} from "../util";

    export default {
        name: "JournalRow",
        props: ["data"],
        components: {
            UsageTable,
            UsageTableRow,
            DownloadsChart
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
    .subscription-row {
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 5px;
        border: 1px solid transparent;
        &:hover {
            background: #f2f2f2;
        }
        &.selected {
            background: #ddd;
            border: 1px solid #ddd;
        }
    }


</style>