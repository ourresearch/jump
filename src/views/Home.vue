<template>

    <v-container fluid class="home pa-0" v-if="api.loadingState==='complete'">
        <div class="loading" style="position: fixed; top:0; left:0; right:0;background: orangered; z-index:10000;"
             v-if="isLoading">loading
        </div>


        <div class="fixed-header-wrapper" style="height: 100px;">
            <div class="fixed-header"
                 style="position:fixed; top:0; background: #fff; width: 100%; z-index:999;">


                <!-- DATA TOOLBAR -->
                <data-toolbar :scenario="scenario"></data-toolbar>



                <!-- TOOLS TOOLBAR -->
                <v-layout align-center flat class="toolbar pa-0">
                    <v-flex shrink>
                        <v-btn icon @click="selectPage" v-if="isNonePageSelected">
                            <v-icon>check_box_outline_blank</v-icon>
                        </v-btn>
                        <v-btn icon @click="unselectAll" v-if="isAllPageSelected">
                            <v-icon>check_box</v-icon>
                        </v-btn>
                        <v-btn icon @click="unselectAll" v-if="isPartPageSelected">
                            <v-icon>indeterminate_check_box</v-icon>
                        </v-btn>
                        <span class="num">
                            {{this.selectedJournals.length}}
                        </span>
                        selected
                        <span v-if="isPartSelected">
                            <v-btn small flat class="add-everything"

                                   @click="selectAll">
                                select all {{nf(this.journalsList.length)}}
                            </v-btn>
                        </span>
                    </v-flex>

                    <v-flex grow></v-flex>

                    <v-flex shrink v-if="this.selectedJournals.length" class="mr-3"
                            style="border-right: 1px solid #bbb;">
                        <v-menu offset-y>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                        flat
                                        small
                                        v-on="on"
                                >
                                    Change subscriptions
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-tile
                                        v-for="(menuItem, index) in subrMenu"
                                        :key="index"
                                        @click="subscribeSelected(menuItem.name)"
                                >
                                    <v-list-tile-title :style="{color: menuItem.color}">
                                        {{ menuItem.displayName }}
                                    </v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </v-flex>


                    <v-flex shrink class="pr-3 mr-3" style="border-right: 1px solid #bbb;">
                        <div>
                            <span class="sorting-by">Sorting by: </span>
                            <v-menu offset-y>
                                <template v-slot:activator="{ on }">
                                    <span class="sort-button" v-on="on">
                                        {{selectedSorter.text}}
                                        <i class="fas fa-caret-down"></i>
                                    </span>
                                </template>
                                <v-list>
                                    <v-list-tile
                                            v-for="sorter in sorters"
                                            :key="sorter.name"
                                            @click="selectSorter(sorter)"
                                    >
                                        <v-list-tile-title>{{ sorter.text }}</v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>

                        </div>


                    </v-flex>

                    <v-flex shrink class="paging">
                        <v-layout align-center>
                            <v-flex class="number">
                                {{pageStartIndex + 1}}-{{pageEndIndex}}
                                of {{journalsList.length}}
                            </v-flex>
                            <v-flex class="pr-4 pl-2">
                                <v-layout>
                                    <v-flex>
                                        <v-btn @click="pageBack" :disabled="isOnFirstPage" flat icon class="ma-0">
                                            <i class="fas fa-angle-left"></i>
                                        </v-btn>
                                    </v-flex>
                                    <v-flex>
                                        <v-btn @click="pageForward" :disabled="isOnLastPage" flat icon class="ma-0">
                                            <i class="fas fa-angle-right"></i>
                                        </v-btn>

                                    </v-flex>
                                </v-layout>
                            </v-flex>

                        </v-layout>
                    </v-flex>

                </v-layout>
            </div>
        </div>


        <!--- SUM-UP REPORT  -->
        <scenario-report :scenario="scenario" :old-scenario="oldScenario"></scenario-report>



        <!--- JOURNALS LIST  -->
        <v-layout column>
            <v-flex grow
                    v-for="journalData in journalsPage"
                    :key="journalData.issnl"
                    class="ma-3">
                <v-layout>
                    <v-flex shrink>
                        <v-checkbox
                                v-model="journalData.isSelected"
                                class="pa-0 mt-1"></v-checkbox>
                    </v-flex>
                    <v-flex grow>
                        <journal-row @subscribe="subscribe" :data="journalData"></journal-row>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>


        <!--- SETTINGS  -->
        <v-layout class="settings pa-5">
            <v-flex>
                <div>
                    <table>
                        <tr :key="setting.name"
                            v-for="setting in userSettingsList">
                            <td style="text-align:right;">
                                {{setting.displayName}}
                            </td>
                            <td>
                                <v-text-field
                                        class="pa-0 ma-0"
                                        v-model="setting.val"
                                ></v-text-field>
                            </td>
                        </tr>

                    </table>
                    <v-layout class="buttons">
                        <v-flex grow></v-flex>
                        <v-btn outline small @click="saveSettings">Save</v-btn>
                        <v-btn outline small @click="isEditingSettings=false">Cancel</v-btn>
                    </v-layout>
                </div>
            </v-flex>
        </v-layout>


    </v-container>
</template>


<script>
    import {api} from "../api.js"

    import DownloadsChart from "../components/DownloadsChart"
    import DownloadsBar from "../components/DownloadsBar"
    import JournalRow from "../components/JournalRow"
    import ScenarioReport from "../components/ScenarioReport"
    import DataToolbar from "../components/DataToolbar"

    import {currency, nFormat} from "../util";
    import {Journal} from "../Journal.js";
    import Scenario from "../Scenario";

    import UserSettings from "../UserSettings";
    import * as display from "../display"


    export default {
        name: 'Home',
        components: {
            DownloadsChart,
            DownloadsBar,
            JournalRow,
            ScenarioReport,
            DataToolbar,
        },
        data: () => ({
            currentPage: 1,
            pageSize: 20,
            sortBy: "default",
            api: api,
            isLoading: false,
            sorters: [
                {text: "Subscription value", name: "subrCpua"},
                {text: "Total usage", name: "totalUsage", isDescending: true},
                {text: "Title", name: "title"},

            ],
            selectedSorter: {text: "Total usage", name: "totalUsage", isDescending: true},
            journalsList: [],
            bigDealCost: 1000000,
            scenarioComparison: {},
            oldScenario: {},
            scenario:{},
            subscriptionNames: [
                "fullSubscription",
                "docdel",
                "ill"
            ],
            settings: null,
            isEditingSettings: false,
            userSettingsList: [],
            display: display,
            apiJournals: [],

        }),
        computed: {

            pageStartIndex() {
                return (this.currentPage - 1) * this.pageSize
            },
            pageEndIndex() {
                return (this.currentPage * this.pageSize)
            },
            isOnFirstPage() {
                return this.currentPage <= 1
            },
            isOnLastPage() {
                const numPages = Math.ceil(this.journalsList.length / this.pageSize)
                return this.currentPage >= numPages
            },


            journalsPage() {
                return this.journalsList
                    .slice(this.pageStartIndex, this.pageEndIndex)
            },
            selectedJournals() {
                return this.journalsList.filter(j => j.isSelected)
            },
            isAllSelected() {
                return this.journalsList.length === this.selectedJournals.length
            },
            isPartSelected() {
                return !this.isAllSelected && this.selectedJournals.length
            },
            isNoneSelected() {
                return this.selectedJournals.length === 0
            },

            isAllPageSelected() {
                return this.journalsPage.every(j => j.isSelected)
            },
            isNonePageSelected() {
                return !this.journalsPage.some(j => j.isSelected)
            },
            isPartPageSelected() {
                return !this.isAllPageSelected && !this.isNonePageSelected
            },
            subrMenu() {
                return ["ill", "docdel", "fullSubscription"].map(name=>{
                    return {
                        name: name,
                        displayName: display.displayName(name),
                        color: display.color(name)
                    }
                })
            },


        },
        methods: {
            nf: nFormat,
            currency: currency,

            // selection stuff
            // *****************
            selectAll() {
                console.log("select all")
                this.journalsList.forEach(j => {
                    j.isSelected = true
                })

            },
            unselectAll() {
                console.log("unselect all")
                this.journalsList.forEach(j => {
                    j.isSelected = false
                })
            },
            selectPage() {
                this.journalsPage.forEach(j => {
                    j.isSelected = true
                })
            },
            pageForward() {
                this.currentPage += 1
                if (!this.isAllSelected) {
                    this.unselectAll()
                }
            },
            pageBack() {
                this.currentPage -= 1
                if (!this.isAllSelected) {
                    this.unselectAll()
                }
            },


            subscribeSelected(newSubscriptionName) {
                console.log("subscribe selected", newSubscriptionName)
                this.selectedJournals.forEach(j => {
                    j.subscribe(newSubscriptionName)
                })
                this.unselectAll()
                this.sortJournalsList()
                this.printScenarioComparison()
            },


            getSubscription(issnl) {
                if (this.subscriptions[issnl]) return this.subscriptions[issnl]
                return "free"
            },

            printScenarioComparison() {
                this.scenario = new Scenario(this.journalsList)
            },

            saveSettings() {
                this.isEditingSettings = false
                this.userSettings.setFromList(this.userSettingsList)
                this.userSettingsList = this.userSettings.getList()
                console.log("saving settings!", this.userSettings)
                this.makeJournalsList()

            },

            subscribe(args) {
                const myIssnl = args.issnl
                const mySubscriptionName = args.subscriptionName

                this.journalsList.find(j => {
                    return j.meta.issnl === myIssnl
                }).subscribe(mySubscriptionName)

                this.sortJournalsList()
                this.printScenarioComparison()


            },
            selectSorter(newSorter) {
                console.log("select sort!", newSorter)
                this.selectedSorter = newSorter
                this.sortJournalsList()
                this.unselectAll()
                this.currentPage = 1
            },
            sortJournalsList() {
                const sortKey = this.selectedSorter.name
                const desc = this.selectedSorter.isDescending
                const sortFn = function (a, b) {
                    let ret = 0
                    if (a.sortKeys[sortKey] < b.sortKeys[sortKey]) {
                        ret = -1
                    } else {
                        ret = 1
                    }
                    if (desc) ret = -ret

                    return ret
                }
                this.journalsList.sort(sortFn)
            },
            makeJournalsList(){
                console.log("printing journals")
                this.apiJournals.forEach((apiJournalData, index) => {
                    this.journalsList.push(new Journal(
                        apiJournalData,
                        this.userSettings
                    ))
                })
                this.printScenarioComparison()
            }

        },
        mounted() {
            console.log("mounted")
            this.userSettings = new UserSettings()
            this.userSettingsList = this.userSettings.getList()

            api.fetchJournals()
                .then(resp => {
                    this.apiJournals = resp
                    this.makeJournalsList()
                    this.oldScenario = new Scenario(this.journalsList)
                })
        },
        watch: {}

    }
</script>


<style lang="scss">
    .sorting-by {
        opacity: .5;
    }

    .v-input {
        input {
            text-align: right !important;
        }

    }

    .sort-button {
        cursor: pointer;
    }

    .fixed-header {
    }

    table.infographic {
        tr {
            &.callout {
                font-weight: bold;
            }

            td.num {
                text-align: right;
                padding: 0 5px;
            }

        }

    }

    table.pretty {
        text-align: right;
        border-collapse: collapse;
        border-top: 1px solid #ddd;

        tr {
            border-bottom: 1px solid #ddd;

            td {
                padding: 2px 10px;
                /*border-left: none;*/
                /*border-right: none;*/
            }
        }

    }

</style>
