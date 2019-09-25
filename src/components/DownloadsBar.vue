<template>

    <div>
        <div class="bar-container" style="height: 100%; flex-grow:1;">
            <v-tooltip top v-for="mod in useTypes">
                <template v-slot:activator="{ on }">
                    <div class="mod" v-on="on" :style="{background: mod.color, height: mod.percentage+'%'}"></div>
                </template>
                <span>
                    {{year}} {{mod.name}}: {{Math.round(mod.percentage)+'%'}} ({{ mod.count.toLocaleString() }} total)
                </span>

            </v-tooltip>
        </div>

    </div>

</template>

<script>
    export default {
        name: "DownloadsBar",
        props: ["subscription", "year"],
        data: () => ({

        }),
        methods: {
        },
        computed: {
            useTypes(){

                return this.subscription.usageStats()
            }
        }
    }
</script>

<style scoped>

</style>