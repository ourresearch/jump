<template>
    <span>
        <i v-if="name==='docdel'" class="fas fa-file-alt"></i>
        <i v-if="name==='ill'" class="far fa-file-alt"></i>
        <i v-if="name==='fullSubscription'" class="fas fa-book"></i>
    </span>
</template>

<script>
    import DownloadsBar from "../components/DownloadsBar"
    import {currency, nFormat} from "../util";

    export default {
        name: "FulfillmentIcon",
        props: ["name"],
        components: {
            DownloadsBar,
        },
        data: () => ({
        }),
        methods: {
        },
        computed: {
        },
        watchers(){
        }
    }
</script>

<style scoped>

</style>