<template>
    <div class="home">

        <v-container fluid grid-list-lg>
            <v-layout row>
                <v-flex xs12>
                    <h1 class="display-4">jump!</h1>
                    <div>top stuff aqui</div>
                </v-flex>
            </v-layout>
            <v-layout row>
                <v-flex md3>
                    filters aqui
                </v-flex>
                <v-flex md9>
                    journals aqui
                </v-flex>



            </v-layout>



        </v-container>





    </div>
</template>


<script>
    import axios from 'axios'

    export default {
        name: 'Home',
        data: () => ({
            articleBreakdown: {},
            numArticles: null,
            numJournals: null
        }),
        computed: {
            bars(){
                return {
                    repository: {
                        name: "Fulltext in a repository",
                        percent: 100 * this.articleBreakdown.num_has_repository_hosted_and_not_publisher_hosted / this.numArticles
                    },
                    both: {
                        name: "Fulltext at publisher and in repository",
                        percent: 100 * this.articleBreakdown.num_has_repository_hosted_and_has_publisher_hosted / this.numArticles
                    },
                    publisher: {
                        name: "Fulltext at publisher",
                        percent: 100 * this.articleBreakdown.num_not_repository_hosted_and_has_publisher_hosted / this.numArticles
                    },
                    closed: {
                        name: "No fulltext found",
                        percent: 100 * this.articleBreakdown.num_closed / this.numArticles
                    },



                }
            },

            bars2(){
                return {
                    repository: 100 * this.articleBreakdown.num_has_repository_hosted_and_not_publisher_hosted / this.numArticles,
                    both: 100 * this.articleBreakdown.num_has_repository_hosted_and_has_publisher_hosted / this.numArticles,
                    publisher: 100 * this.articleBreakdown.num_not_repository_hosted_and_has_publisher_hosted / this.numArticles,
                    closed: 100 * this.articleBreakdown.num_closed / this.numArticles,
                }
            },
            results() {
                return this.rawResults.filter(x => {
                    if (!this.articleSearch) {
                        return true
                    } else if (x.issns.join().indexOf(this.articleSearch) > -1) {
                        return true
                    } else if (x.journal_name.indexOf(this.articleSearch) > -1) {
                        return true
                    } else {
                        return false
                    }
                })
            }
        },
        methods: {
            fetch() {
                let url = "https://api.cdl.metrics.unpaywall.org/breakdown?bigdeal=cdl_elsevier"
                return axios.get(url)
                    .then(resp => {
                        this.articleBreakdown = resp.data.article_breakdown
                        this.numArticles = resp.data.num_articles_total
                        this.numJournals = resp.data.num_journals_total
                        return true
                    })
                    .catch(e => {
                        console.log("error from server", e)
                        return false
                    })
            }
        },
        mounted() {
            this.fetch()
        }
    }
</script>



<style scoped lang="scss">

    .bar-container {
        width: 100%;
        height: 100px;
        display: flex;
        .bar {
            height: 100%;
            &.repository {background: #4CAF50;}
            &.both {background: #AE9E24;}
            &.publisher {background: #FF8F00;}
            &.closed {background: gray;}
        }
    }
    .stats {
        .stat {
            &.repository {color: #4CAF50;}
            &.both {color: #AE9E24;}
            &.publisher {color: #FF8F00;}
            &.closed {color: gray;}
            font-size: 22px;
            .num {
                width: 3em;
                font-size: 34px !important;
                display: inline-block;
                text-align: right;
                margin-right: 10px;
                font-weight: bold;
                }
        }
    }



</style>
