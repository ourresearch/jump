<template>
    <v-layout align-items-top class="text-xs-right">


        <v-flex xs2 class="mx-2">
            {{name}}
        </v-flex>
        <v-flex xs1 class="mx-2">
            {{nf(count)}}
        </v-flex>
        <v-flex xs1 v-if="cost" class="mx-2">
            {{currency(cost, true)}}
        </v-flex>
        <v-flex xs1 v-if="costPerPaidUse" class="px-2">
            {{currency(costPerPaidUse)}}
        </v-flex>

    </v-layout>


</template>

<script>

    import {nFormat, currency} from "../util"

    export default {
        name: "UsageTypeRow",
        props: [
            "name",

            // data
            "count",
            "cost",
            "costPerPaidUse",

            // presentation
            "isHypothetical",
            "isHeadingRow"
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