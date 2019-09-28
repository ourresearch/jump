<template>
            <div style="display: flex; min-width: 30px; height: 100%; min-height: 20px;">
<!--                <downloads-bar-->
<!--                        :snap="overallUseCounts"-->
<!--                        class="pr-1"-->
<!--                        style="flex-grow:3;">-->
<!--                </downloads-bar>-->

                <downloads-bar
                        v-for="subscription in yearlySubscriptions"
                        :year="subscription.year"
                        style="flex-grow: 1;"
                        :subscription="subscription"></downloads-bar>


            </div>

</template>

<script>
    import {sumObjects} from "../util"

    import DownloadsBar from "../components/DownloadsBar"

    export default {
        name: "AccessGraph",
        props: ["yearlySubscriptions"],
        components: {
            DownloadsBar
        },
        data: () => ({

        }),
        computed: {
        },
        mounted(){
        }
    }
</script>

<style scoped>

</style>