<template>
    <v-container fluid>
        <usage-type-row
                v-for="stat in usageStats"
                v-if="stat.count > 0.5"
                :name="stat.name"
                :count="stat.count"
                :cost="stat.cost"
                :cost-per-paid-use="stat.costPerCount"
        ></usage-type-row>

    </v-container>
</template>

<script>
    import {currency, nFormat} from "../util";
    import UsageTypeRow from "../components/UsageTypeRow"


    export default {
        name: "UsageTable",
        props: ["subscription"],
        components: {
            UsageTypeRow
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