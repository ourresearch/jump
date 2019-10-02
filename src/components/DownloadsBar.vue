<template>

    <div class="bar-container" style="height: 100%; width: 100%; flex-grow:1;">
        <v-tooltip top
                   :key="segment.name"
                   v-for="segment in computedSegments">
            <template v-slot:activator="{ on }">
                <div class="segment" v-on="on" :style="{background: segment.color, height: segment.perc+'%'}"></div>
            </template>
            <span>
                {{computedYear}} {{segment.name}}: {{Math.round(segment.perc)+'%'}} ({{ format(segment.count) }} total)
            </span>

        </v-tooltip>
    </div>


</template>

<script>
    import {usageColors} from "../subscription";
    import {nFormat, currency} from "../util";

    export default {
        name: "DownloadsBar",
        props: ["segments", "year", "isCurrency"],
        data: () => ({}),
        methods: {
            nf: nFormat,
            currency: currency,
            format(num) {
                if (this.isCurrency){
                    return currency(num, true)
                }
                else {
                    return nFormat(num)
                }
            }
        },
        computed: {
            sumCount() {
                return this.segments.map(x => x.count).reduce((a, b) => a + b)
            },
            computedYear() {
                return this.year || "All years"
            },
            computedSegments() {
                return this.segments.map(seg => {
                    return {
                        name: seg.name,
                        count: seg.count,
                        color: usageColors[seg.name],
                        perc: 100 * seg.count / this.sumCount
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>