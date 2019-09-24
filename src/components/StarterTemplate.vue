<template>
    <v-container fluid class="scenario-comparison">



    </v-container>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import UsageReport from "../components/UsageReport"
    import {currency, nFormat} from "../util";

    export default {
        name: "Journal",
        props: ["yearlySummarySnaps", "overallSnap", "bigDealYearlySummarySnaps"],
        components: {
            DownloadsBar,
            UsageReport
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