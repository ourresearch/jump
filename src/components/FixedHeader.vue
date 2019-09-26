<template>
    <v-container fluid class="scenario-comparison">
        <v-layout>
            i am the fixed header
        </v-layout>


    </v-container>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import {currency, nFormat} from "../util";

    export default {
        name: "Journal",
        props: ["oldScenario", "newScenario", "filters"],
        components: {
            DownloadsBar,
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