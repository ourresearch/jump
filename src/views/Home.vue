<template>

    <v-container fluid class="home pa-0" v-if="scenario && scenario.journals">
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
                    <v-flex xs3></v-flex>
                    <v-flex shrink class="ml-2">
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
                            {{this.scenario.getSelectedJournals().length}}
                        </span>
                        selected
                        <span v-if="isPartSelected">
                            <v-btn small flat class="add-everything"

                                   @click="selectAll">
                                select all {{nf(this.scenario.journals.length)}}
                            </v-btn>
                        </span>
                    </v-flex>

                    <v-flex grow></v-flex>

                    <v-flex shrink v-if="this.scenario.getSelectedJournals().length" class="mr-3"
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
                                        {{userSettings.journalSorter.getSelectedSorter().text}}
                                        <i class="fas fa-caret-down"></i>
                                    </span>
                                </template>
                                <v-list>
                                    <v-list-tile
                                            v-for="mySorter in userSettings.journalSorter.sorters"
                                            :key="mySorter.name"
                                            @click="userSettings.journalSorter.setSorter(mySorter.name)"
                                    >
                                        <v-list-tile-title>{{ mySorter.text }}</v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>

                        </div>


                    </v-flex>

                    <v-flex shrink class="paging" style="border-right: 1px solid #bbb;">
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
                    <v-flex shrink>
                        <v-layout align-center>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon v-on="on" @click="isAllExpanded = !isAllExpanded">
                                        <i class="fas fa-expand-arrows-alt" v-if="!isAllExpanded"></i>
                                        <i class="fas fa-compress-arrows-alt" v-if="isAllExpanded"></i>
                                    </v-btn>
                                </template>
                                <span>
                                        expand all journals
                                </span>
                            </v-tooltip>
                        </v-layout>
                    </v-flex>

                </v-layout>
            </div>
        </div>


        <!--- SUM-UP REPORT  -->
        <scenario-report :scenario="scenario"
                         :old-scenario="oldScenario"
                         @subscribe="gangSubscribeHandler"
        ></scenario-report>


        <v-layout>

            <!--- SIDEBAR  -->
            <v-flex xs3 class="pa-4">
                <v-layout>
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

                </v-layout>
            </v-flex>


            <!--- JOURNALS LIST  -->
            <v-flex xs9>
                <v-layout column>
                    <v-flex grow
                            v-for="journalData in journalsPage"
                            :key="journalData.issnl"
                            class="ma-1">
                        <v-layout class="journal-row pa-3"
                                  :class="{expanded:journalData.isExpanded, subscribed: journalData.getSubr().name==='fullSubscription'}">
                            <v-flex shrink>
                                <v-checkbox
                                        v-model="journalData.isSelected"
                                        class="pa-0 mt-1"></v-checkbox>
                            </v-flex>
                            <v-flex grow>
                                <journal-row @subscribe="subscribeHandler" :data="journalData"></journal-row>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
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
    import {Scenario, BigDealScenario} from "../Scenario";

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
            sorter: {},
            sorters: [
                {text: "Best Cost Per Negotiable Use", name: "bestCpnu"},
                {text: "Best Cost Per Negotiable Use (no ILL)", name: "bestCpnuNoIll"},
                {text: "Total usage", name: "totalUsage", isDescending: true},
                {text: "Title", name: "title"},
                {text: "Citations", name: "citations", isDescending: true},

            ],
            selectedSorter: {text: "Total usage", name: "totalUsage", isDescending: true},
            journalsList: [],
            bigDealCost: 1000000,
            scenarioComparison: {},
            oldScenario: {},
            scenario: {},
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
            cheapestCost: 0,
            isAllExpanded: false,

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
                const numPages = Math.ceil(this.scenario.journals.length / this.pageSize)
                return this.currentPage >= numPages
            },

            settingsHash() {
                return this.userSettings.getHash()
            },

            journalsPage() {
                if (this.scenario.journals) {
                    return this.scenario.getFilteredJournals()
                        .slice(this.pageStartIndex, this.pageEndIndex)
                        .map(j=>{
                            if (this.isAllExpanded){
                                j.isExpanded = true
                            }
                            return j
                        })
                } else {
                    return []
                }
            },
            selectedJournals() {
                return this.scenario.journals.filter(j => j.isSelected)
            },
            isAllSelected() {
                return this.scenario.journals.length === this.selectedJournals.length
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
                return ["ill", "docdel", "fullSubscription"].map(name => {
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
                this.scenario.journals.forEach(j => {
                    j.isSelected = true
                })

            },
            unselectAll() {
                this.scenario.journals.forEach(j => {
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

            expandAll() {
                console.log("expand all!")
                this.isAllExpanded = true
            },


            subscribeSelected(newSubscriptionName) {
                console.log("subscribe selected", newSubscriptionName)
                this.selectedJournals.forEach(j => {
                    // this.userSettings.setSubr(j.meta.issnl, newSubscriptionName)
                    this.scenario.setSubr(j.meta.issnl, newSubscriptionName)
                })
                this.unselectAll()
                // this.sortJournalsList()
            },
            gangSubscribeHandler(args) {
                console.log("gang subscribe!", args)
                this.unselectAll()
                this.scenario.setSubrsToCheapest(args.maxCost)


            },


            saveSettings() {
                this.isEditingSettings = false
                this.userSettings.setFromList(this.userSettingsList)
                this.userSettingsList = this.userSettings.getList()
                console.log("saving settings!", this.userSettings)

            },


            subscribeHandler(args) {
                this.scenario.setSubr(args.issnl, args.subscriptionName)
                // this.userSettings.setSubr(args.issnl, args.subscriptionName)
                // this.sortJournalsList()
            },
            setSorter(newSorterName) {
                const newSorter = this.sorters.find(s => s.name === newSorterName)
                this.selectedSorter = newSorter
                // this.sortJournalsList()
                this.unselectAll()
                this.currentPage = 1
            },

            // sortJournalsList() {
            //     const sortKey = this.selectedSorter.name
            //     const desc = this.selectedSorter.isDescending
            //     const sortFn = function (a, b) {
            //         let ret = 0
            //         const aVal = a.getSortFn(sortKey)()
            //         const bVal = b.getSortFn(sortKey)()
            //
            //         if (aVal < bVal) {
            //             ret = -1
            //         } else {
            //             ret = 1
            //         }
            //         if (desc) ret = -ret
            //
            //         return ret
            //     }
            //     this.scenario.journals.sort(sortFn)
            // },

        },
        mounted() {
            console.log("mounted")

            this.userSettings = new UserSettings()
            this.scenario = new Scenario(this.userSettings)
            this.oldScenario = new BigDealScenario(this.userSettings)


            this.userSettingsList = this.userSettings.getList()

            api.fetchJournals()
                .then(resp => {
                    console.log("printing journals")

                    this.apiJournals = resp
                    this.scenario.setJournals(resp)
                    this.oldScenario.setJournals(resp)
                    this.cheapestCost = this.scenario.getCheapestCost()
                    // this.sortJournalsList()


                })
        },
        watch: {}

    }
</script>


<style lang="scss">
    .journal-row {
        &.subscribed {
            /*background: rgba(176, 255, 255, 0.4);*/
            background: rgba(0, 229, 226, 0.1) !important;
        }

        &:hover {
            &.subscribed {
                /*background: rgba(176, 255, 255, 0.4);*/
                background: rgba(0, 229, 226, 0.1);
            }
        }

        &.expanded {

        }
    }


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
