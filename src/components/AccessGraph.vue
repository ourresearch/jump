<template>
    <v-layout class="access-graph" style="height:100%;">
        <v-flex v-for="year in scenario.years" class="px-0 mx-0" style="border-right: 1px solid transparent">
            <downloads-bar :snap="year"></downloads-bar>
        </v-flex>
        <v-flex class="pl-2">
            <downloads-bar :snap="scenario.overall"></downloads-bar>
        </v-flex>
    </v-layout>

</template>

<script>
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