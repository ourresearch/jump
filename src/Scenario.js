import _ from "lodash";
import {SubscriptionPackage} from "./subscription";


export default class Scenario {
    constructor(journalsList) {
        this.journalsList = journalsList


        // flat list of every subscription-year from every journal
        const allYearSubscriptions = [].concat(...journalsList.map(x => x.getYearlySubscriptions()))

        // group them all into years
        const subscriptionsDictByYear = _.groupBy(allYearSubscriptions, function (sub) {
            return sub.year
        })

        // make a single SubscriptionYear for every year, summing up all the journals
        this.yearlySubrPackages = Object.entries(subscriptionsDictByYear)
            .map(([year, subscriptionsList]) => {
                return new SubscriptionPackage(subscriptionsList, year)
            })

        // all years, all journals.
        this.overallSubrPackage = new SubscriptionPackage(
            journalsList.map(x=>x.subscription)
        )
    }


    // @todo replace this with just delivering counts of this.overallSubrPackage
    getJournalsByType(){
        const groups = _.groupBy(this.journalsList, j=>{
            return j.subscription.name
        })

        const groupStats = Object.entries(groups).map(([subrName, journalsArr])=>{
            return {
                name: subrName,
                count: journalsArr.length,
            }
        })
        return groupStats
    }

    getSubr(subrName) {
        return this.overallSubrPackage.getSubscription(subrName)
    }



}