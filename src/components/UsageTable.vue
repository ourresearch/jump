<template>
    <v-container fluid class="body-1 pa-0">
        <usage-table-row
                v-for="stat in usageStats"
                :key="stat.name"
                :name="stat.name"
                :count="stat.count"
                :cost="stat.cost"
                :percentage="stat.percentage"
                :cost-per-paid-use="stat.costPerCount"
        ></usage-table-row>

    </v-container>
</template>

<script>
    import {currency, nFormat} from "../util";
    import UsageTableRow from "../components/UsageTableRow"


    export default {
        name: "UsageTable",
        props: ["subscription"],
        components: {
            UsageTableRow
        },
        data: () => ({
        }),
        methods: {
            nf: nFormat,
            currency: currency,
        },
        computed: {
            usageStats(){
                return this.subscription.usageStats()
            }
        },
        watchers(){
        }
    }
</script>

<style scoped>

</style>