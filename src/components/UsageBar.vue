<template>

    <div>
        <div class="bar-container" style="height: 100%; flex-grow:1;">
            <v-tooltip top v-for="(useCount, useName) in useTypes">
                <template v-slot:activator="{ on }">
                    <div class="mod" v-on="on" :style="{background: colors[useName], height: perc(useCount)+'%' }"></div>
                </template>
                <span>
                    {{year}} {{useName}}: {{Math.round(perc(useCount))+'%'}} ({{ useCount.toLocaleString() }} total)
                </span>

            </v-tooltip>
        </div>

    </div>

</template>

<script>
    const colors = {
        hardTurnaway: "#555",
        softTurnaway: "999",
        fullSubscription: "#a6cee3",
        docdel: "#1f78b4",
        backCatalog: "#b2df8a",
        oa: "#33a02c"

    }


    export default {
        name: "UsageBar",
        props: ["useCounts", "year"],
        data: () => ({
            colors: colors,
        }),
        methods: {
            perc: function(val){
                return (100 * (val / this.usesSum))

            }
        },
        computed: {
            usesSum(){
                return Math.sum(Object.values(this.useCounts))
            }
        }
    }
</script>

<style scoped>

</style>