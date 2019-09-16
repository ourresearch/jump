<template>
    <v-container>
        <v-layout align-items-top>
            <v-flex class="fulfillment-graph" xs2>
                graph
            </v-flex>

            <v-flex class="turnaway-uses" xs2>
                turnaways
            </v-flex>

            <v-flex class="fulfilled-uses" xs4>
                fulfillments
            </v-flex>

            <v-flex class="fulfilled-uses" xs2>
                costs
            </v-flex>
            <v-flex class="fulfilled-uses" xs2>
                cost per use
            </v-flex>

        </v-layout>


    </v-container>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"

    export default {
        name: "Timeline",
        props: ["timeline"],
        components: {
            DownloadsBar
        },
        data: () => ({}),
        methods: {
            currency(num) {
                let round = Math.round(num * 100) / 100
                return "$" + round.toLocaleString()
            }
        },
        computed: {
            snapsByYear() {
                return this.timeline.getSnapsDicts()
            },
            summarySnap() {
                return this.timeline.getSummarySnapDict()
            }


        }
    }
</script>

<style scoped lang="scss">
    .stat-col {
        text-align: right;

        .big-num {
            font-size: 30px;

            &.unsubscribed {
                opacity: 0.1;
            }
        }
    }

</style>