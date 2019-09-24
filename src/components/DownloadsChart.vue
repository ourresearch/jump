<template>
            <div style="display: flex; width:100%; height: 100%; min-height: 50px;">
                <downloads-bar
                        :snap="overallUseCounts"
                        class="pr-1"
                        style="flex-grow:3;">
                </downloads-bar>

                <downloads-bar
                        v-for="snap in yearlyUseCounts"
                        :year="snap.year"
                        style="flex-grow: 1;"
                        :snap="snap"></downloads-bar>
            </div>

</template>

<script>
    import {sumObjects} from "../util"

    import DownloadsBar from "../components/DownloadsBar"
    import UsageBar from "../components/UsageBar"

    export default {
        name: "AccessGraph",
        props: ["yearlyUseCounts", "overallUseCounts"],
        components: {
            DownloadsBar
        },
        data: () => ({

        }),
        computed: {
        },
        mounted(){
            console.log("mounting downloads chart", this.yearlyUseCounts, this.overallUseCounts)
        }
    }
</script>

<style scoped>

</style>