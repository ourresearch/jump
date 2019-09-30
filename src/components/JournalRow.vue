<template>
    <v-container grid-list-sm fluid class="journal pa-0">


        <!-- journal META section -->
        <v-layout align-content-center align-center>

            <v-flex shrink class="pa-1" style="align-self: stretch;">
                <downloads-chart
                        :yearly-subscriptions="yearlySubscriptions"></downloads-chart>
            </v-flex>

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
                                    {{data.subscription.getUseCountAdjusted().toLocaleString()}}
                                </div>
                            </template>
                            <span>
                                2018 usage (Adj)
                            </span>
                        </v-tooltip>
                    </div>
                    <div class="lower body-1">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <div v-on="on">
                                    {{nf(data.subscription.getUseCountAdjustmentPerc())}}%
                                </div>
                            </template>
                            <span>
                                Adjustment factor
                            </span>
                        </v-tooltip>
                    </div>
                </div>
            </v-flex>


            <v-flex
                    xs1
                    class="numbers subscription-item"
                    @click="$emit('subscribe',{issnl: data.meta.issnl, subscriptionName: subr.name})"
                    :key="subr.name"
                    v-for="subr in data.getSubrs()"
                    v-if="subr.name !=='docdel'"
            >
                <div>
                    <div class="upper">
                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <div class="numbers" style="display:inline-block;" v-on="on">
                                    {{currency(subr.costPerPaidUse())}}
                                </div>
                            </template>
                            <span>
                                {{subr.name}} CPUa
                            </span>
                        </v-tooltip>
                    </div>
                    <div class="lower body-1">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <div class="numbers" style="display:inline-block;" v-on="on">
                                    {{currency(subr.cost)}}
                                </div>
                            </template>
                            <span>
                                {{subr.name}} total cost ({{currency(subr.cost - data.subscription.cost, true, true)}})
                            </span>
                        </v-tooltip>

                    </div>
                </div>
<!--                <div class="icon">-->
<!--                    <fulfillment-icon :name="subr.name"></fulfillment-icon>-->
<!--                </div>-->
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
    .numbers {
        text-align: right;

        i.light {
            opacity: .8;
            font-size: 10px;
        }
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