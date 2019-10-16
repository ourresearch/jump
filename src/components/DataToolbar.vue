<template>
    <v-container v-if="scenario.journals.length" fluid class="data-toolbar pa-0 ma-0">
        <v-layout class="py-1 px-3">
            <!-- num journals -->
            <v-flex xs3></v-flex>
            <v-flex xs3 class="pl-4">
                <v-layout>
                    <v-flex grow class="data">
                        <div>
                            <div class="num headline">
                                {{nf(scenario.getSubrTable().fullSubscription)}}
                            </div>
                            <div class="name body-1">
                                Subscriptions
                            </div>
                        </div>
                    </v-flex>
                </v-layout>
            </v-flex>


            <!-- usage -->
            <v-flex xs3>
                <v-layout>
                    <v-flex grow class="data">
                        <div>
                            <div class="num headline">
                                {{(scenario.getPercInstantAccess()).toFixed(2)}}%
                            </div>
                            <div class="name body-1">
                                Instant access
                            </div>
                        </div>
                    </v-flex>
                </v-layout>
            </v-flex>


            <!-- cost -->
            <v-flex xs3>
                <v-layout>

                    <v-flex grow class="data">
                        <div>
                            <div class="num headline">
                                {{currency(scenario.getCostTotal(), true)}}
                            </div>
                            <div class="name body-1">
                                Annual Cost
                            </div>
                        </div>
                    </v-flex>
                </v-layout>
            </v-flex>

            <!-- cost per paid use -->
<!--            <v-flex xs3>-->
<!--                <div class="num headline">-->
<!--                    {{currency(scenario.getCostPerInstantUse(), 3)}}-->
<!--                </div>-->
<!--                <div class="name body-1">-->
<!--                    Cost per instant use-->
<!--                </div>-->
<!--            </v-flex>-->
        </v-layout>


    </v-container>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import {currency, nFormat} from "../util";
    import * as display from "../display"


    export default {
        name: "DataToolbar",
        props: ["scenario"],
        components: {
            DownloadsBar,
        },
        data: () => ({
            display:display,
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

<style scoped lang="scss">
    .data-toolbar {
        border-bottom: 1px solid #999;
    }
    div.num {
        display: inline;
        &.headline {
            font-size: 20px !important;
        }

    }
    div.name {
        display: inline;
    }


</style>