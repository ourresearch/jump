<template>
    <v-container>
        <v-layout class="timeline">
            <v-flex class="stat-col">
                <div class="label">Downloads</div>
                <div class="big-num">
                     {{ summarySnap.downloadsSum.toLocaleString() }}
                </div>

                <div class="small-num" v-if="summarySnap.downloads.purchased">
                    {{ summarySnap.downloads.purchased.toLocaleString() }}
                    <span class="perc">
                        ({{ Math.round(100*summarySnap.downloads.purchased / summarySnap.downloadsSum) }}%)

                    </span>
                    purchased

                </div>

                <div class="small-num" v-if="summarySnap.downloads.turnaway">
                    {{ summarySnap.downloads.turnaway.toLocaleString() }}
                    <span class="perc">
                        ({{ Math.round(100*summarySnap.downloads.turnaway / summarySnap.downloadsSum) }}%)

                    </span>
                    turnaways

                </div>

            </v-flex>
            <v-flex class="stat-col">
                <div class="bar-graph" style="height: 100%; display: flex;">
                    <div class="bar" style="width: 15px; height:100%; margin-right:10px">
                        <downloads-bar :snap="summarySnap"></downloads-bar>
                    </div>
                    <div class="bar" style="width: 15px; height:100%;" v-for="snap in snapsByYear">
                        <downloads-bar :snap="snap"></downloads-bar>
                    </div>
                </div>
            </v-flex>

            <v-flex class="stat-col">
                <div class="label">Price</div>
                <div class="big-num">
                    {{ currency(summarySnap.price) }}
                </div>
            </v-flex>
            <v-flex class="stat-col">
                <div class="label">Cost per purchased download</div>
                <div class="big-num">
                    {{currency(summarySnap.costPerPurchasedDownload)}}
                </div>
<!--                <div class="small-num">-->
<!--                    {{ currency(summarySnap.costPerDownload) }}-->
<!--                    per any download-->
<!--                </div>-->
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
            currency(num){
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
        }
    }

</style>