<template>
    <v-container class="timeline pa-2">


<!--        <v-layout>-->
<!--            <v-flex>-->
<!--                <pre>-->
<!--                    {{useReport.uses}}-->
<!--                </pre>-->
<!--            </v-flex>-->


<!--        </v-layout>-->
        <v-layout>


            <v-flex>
                <span class="name headline">
                    {{journalMeta.title}}
                </span>
                <span class="topic body-1">
                    {{ journalMeta.subject}}
                </span>
            </v-flex>
        </v-layout>

<!--        <v-layout>-->
<!--            <v-flex>-->
<!--                <pre>-->
<!--                    {{useReport}}-->
<!--                </pre>-->
<!--            </v-flex>-->
<!--        </v-layout>-->


        <v-layout>
            <v-flex>
                <timeline :journal-years="journalYears"></timeline>
<!--                <pre>journal years: {{journalYears}}</pre>-->
            </v-flex>
        </v-layout>



    </v-container>
</template>

<script>
    import Timeline from "../components/Timeline"
    import {store} from "../search.js"

    export default {
        name: "Journal",
        props: ["issnl"],
        components: {
            DownloadsBar,
            Timeline
        },
        data: () => ({
            store: store,
        }),
        methods: {
            currency(num) {
                let round = Math.round(num * 100) / 100
                return "$" + round.toLocaleString()
            },
            nf: store.nFormat,
            setSubscription(name){
                    this.store.setSubscription(this.issnl, name)
            }

        },
        computed: {
            journalYears(){
                return store.getJournalYear(this.issnl)
            },
            useReport() {
                return store.getUseReport(this.issnl)
            },
            journalMeta(){
                return store.getJournalMeta(this.issnl)
            },
            subscriptionName(){
                return this.store.getSubscription(this.issnl)
            },
            myUserSettings(){
                return this.store.user.journals[this.issnl]
            }
        },
        watchers(){
        }
    }
</script>

<style scoped lang="scss">
    .timeline {
        /*text-align: right;*/
    }


    .main-number {
        font-size: 30px;
    }

    .under-number {
        font-size: 12px;
    }


    .stat-col {
        text-align: right;

        .big-num {
            font-size: 30px;

            &.unsubscribed {
                opacity: 0.1;
            }
        }
    }

</style>