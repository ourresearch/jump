<template>
    <v-container fluid class="body-1 pa-0">
        <usage-type-row
                v-for="stat in usageStats"
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