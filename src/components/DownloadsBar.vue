<template>
    <div style="height: 100%; width: 100%;">
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <div class="turnaways" v-on="on"
                     :style="{background: 'gray', height: snap.prop.turnaway*100 +'%'}"></div>
            </template>
            <span>{{ snap.year }} turnaways: {{ Math.round(snap.prop.turnaway*100) + "%" }} ({{ snap.raw.turnaway.toLocaleString() }} total)</span>
        </v-tooltip>
    
        <v-tooltip left>
            <template v-slot:activator="{ on }">
                <div class="oa" v-on="on"
                     :style="{background: 'orange', height: snap.prop.oa*100 +'%'}"></div>
            </template>
            <span>{{ snap.year }} OA: {{ Math.round(snap.prop.oa*100) + "%" }}</span>
        </v-tooltip>
    
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <div class="back-catalog" v-on="on"
                     :style="{background: 'mediumblue', height: snap.prop.backCatalog*100 +'%'}"></div>
            </template>
            <span>{{ snap.year }} Back catalog: {{ Math.round(snap.prop.backCatalog*100) + "%" }}</span>
        </v-tooltip>
    </div>
    
</template>

<script>
    export default {
        name: "DownloadsBar",
        props: ["snap"],
        data: () => ({

        }),
        computed: {
          isOnBasepage(){
              return false;
          }
        }
    }
</script>

<style scoped>

</style>