<template>
    <div class="bar-container" style="height: 100%; width: 100%;">

        <v-tooltip top v-for="(perc, name) in snap.downloadsPerc">
            <template v-slot:activator="{ on }">
                <div class="download-type" v-on="on" :style="{background: color(name), height: perc+'%'}"></div>
            </template>
            <span>
                {{snap.year}} {{name}}: {{Math.round(perc)+'%'}} ({{ snap.downloads[name].toLocaleString() }} total)
            </span>

        </v-tooltip>
    </div>
    
</template>

<script>
    export default {
        name: "DownloadsBar",
        props: ["snap"],
        data: () => ({

        }),
        methods: {
            color(downloadType){
                let colors = {
                    backCatalog: "#c0ca33",
                    oa: "#43a047",
                    turnaway: "#555",
                    purchased: "#ef5350",
                    docdel: "#ff7043"
                }
                return colors[downloadType]
            }
        },
        computed: {
          isOnBasepage(){
              return false;
          }
        }
    }
</script>

<style scoped>

</style>