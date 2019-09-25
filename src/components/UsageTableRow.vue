<template>
    <v-layout align-items-top class="text-xs-right">


        <v-flex xs2 class="mx-2 text-xs-left">
            {{name}}
        </v-flex>
        <v-flex xs2 class="mx-2">
            {{nf(count)}}
        </v-flex>
        <v-flex xs1>
            {{nf(percentage)}}%
        </v-flex>
        <v-flex xs2 v-if="cost" class="mx-2">
            {{currency(cost, true)}}
        </v-flex>
        <v-flex xs2 v-if="costPerPaidUse" class="px-2">
            {{currency(costPerPaidUse)}}
        </v-flex>

    </v-layout>


</template>

<script>

    import {nFormat, currency} from "../util"

    export default {
        name: "UsageTableRow",
        props: [
            "name",
            "count",
            "cost",
            "costPerPaidUse",
            "percentage",
        ],
        components: {},
        data: () => ({}),
        methods: {
            currency: currency,
            nf: nFormat

        },
        computed: {},
        mounted() {
        }
    }
</script>

<style scoped lang="scss">

</style>