<template>
    <div class="bar-container" style="height: 100%; flex-grow:1;">
        <v-tooltip top v-for="mod in mods">
            <template v-slot:activator="{ on }">
                <div class="mod" v-on="on" :style="{background: mod.color, height: mod.prop*100+'%'}"></div>
            </template>
            <span>
                {{year}} {{mod.name}}: {{Math.round(mod.prop*100)+'%'}} ({{ mod.count.toLocaleString() }} total)
            </span>

        </v-tooltip>
    </div>
    
</template>

<script>
    export default {
        name: "DownloadsBar",
        props: ["mods", "year"],
        data: () => ({

        }),
        methods: {
        },
        computed: {
        }
    }
</script>

<style scoped>

</style>