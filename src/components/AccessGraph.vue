<template>
    <v-layout class="access-graph" style="height:100%;">
        <v-flex v-for="year in scenario.years" class="px-0 mx-0" style="border-right: 0px solid transparent; max-width: 5%;">
            <downloads-bar :snap="year"></downloads-bar>
        </v-flex>
        <v-flex class="pl-2" style="max-width: 40%">
            <downloads-bar :snap="scenario.overall"></downloads-bar>
        </v-flex>
    </v-layout>



</template>

<script>
    // red #d32f2f

    import DownloadsBar from "../components/DownloadsBar"
    export default {
        name: "AccessGraph",
        props: ["scenario"],
        components: {
            DownloadsBar
        },
        data: () => ({

        }),
        computed: {
        }
    }
</script>

<style scoped>

</style>