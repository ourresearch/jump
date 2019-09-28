<template>
    <v-container grid-list-sm fluid class="journal pa-0">


        <!-- journal META section -->
        <v-layout align-content-center align-center>

            <v-flex shrink class="pa-1" style="align-self: stretch;">
                <downloads-chart
                        :yearly-subscriptions="yearlySubscriptions"></downloads-chart>
            </v-flex>
            <v-flex xs3>
                <div>
                    <div class="name title">
                        {{data.meta.title}}
                    </div>
                    <div class="topic body-1">
                        <!--                                {{data.meta.issnl}}-->
                        {{ data.meta.subject}}
                    </div>

                </div>
            </v-flex>


            <v-flex xs2 class="impact numbers">
                <v-layout>
                    <v-flex shrink style="flex-basis: 4em;">
                        <v-tooltip left>
                            <template v-slot:activator="{ on }">
                                <div  v-on="on">
                                    {{data.citations.toLocaleString()}}
                                    <i class="fas fa-pencil-alt light"></i>
                                </div>
                            </template>
                            <span>
                                2018 citations from MIT faculty
                            </span>
                        </v-tooltip>
                    </v-flex>
                    <v-flex shrink style="flex-basis: 7em;">
                        <v-tooltip left>
                            <template v-slot:activator="{ on }">
                                <div  v-on="on">
                                    {{data.useCount.toLocaleString()}}
                                    <i class="fas fa-glasses light"></i>
                                </div>
                            </template>
                            <span>
                                2018 downloads from MIT faculty
                            </span>
                        </v-tooltip>
                    </v-flex>
                </v-layout>
            </v-flex>



            <v-flex xs3 class="subscriptions numbers">
                <v-layout>
                    <v-flex
                        class="subscription-item"
                        :class="{selected: stat.name === data.subscription.name}"
                        @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: stat.name})"
                        v-for="stat in possibleUsageStats">
                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <div style="max-width: 6em;"  v-on="on">
                                    {{currency(stat.cost, true)}}
                                    <fulfillment-icon :name="stat.name"></fulfillment-icon>
                                </div>
                            </template>
                            <span>
                                select {{stat.name}}
                            </span>
                        </v-tooltip>
                    </v-flex>
                </v-layout>
            </v-flex>



        </v-layout>



    </v-container>
</template>

<script>
    import UsageTable from "../components/UsageTable"
    import UsageTableRow from "../components/UsageTableRow"
    import DownloadsChart from "../components/DownloadsChart"
    import FulfillmentIcon from "../components/FullfillmentIcon"

    import {currency, nFormat} from "../util";

    export default {
        name: "JournalRow",
        props: ["data"],
        components: {
            UsageTable,
            UsageTableRow,
            DownloadsChart,
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
            possibleUsageStats() {
                return this.data.getPossibleUsageStats()
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
    .numbers {
        text-align: right;
        i.light {opacity: .8; font-size: 10px;}
    }
    .subscription-item {
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 5px;
        border: 1px solid transparent;
        font-weight: light;

        &:hover {
            background: #f2f2f2;
        }

        &.selected {
            background: #ddd;
            border: 1px solid #ddd;
            font-weight: bold;
        }

    }


</style>