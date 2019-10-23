import JournalSorter from "./JournalSorter.js"
import {hashCode} from "./util";



const displayNames = {
    docDelCostPerUse: "DocDel transaction cost",
    illCostPerUse: "ILL transaction cost",
    hardTurnawayProp: "ILL/DocDel request percentage",
    bigDealCostAnnualIncrease: "Big Deal cost % annual increase",
    subrCostAnnualIncrease: "A-la-carte subscription cost % annual increase",
    bigDealCost: "Big Deal annual cost",
    showDocdel: "Include Document Delivery",

    downloadsPerCitation: "Downloads to add for each citation",
    downloadsPerAuthorship: "Downloads to add for each authorship",
}

export default class UserSettings {
    constructor(){
        // item-level acquisition
        this.docDelCostPerUse = 25
        this.illCostPerUse = 5
        this.hardTurnawayProp = 0.1

        // cost: annual increase
        this.bigDealCostAnnualIncrease = 0.05
        this.subrCostAnnualIncrease = 0.08

        // cost
        this.bigDealCost = 2200000

        // impact
        this.downloadsPerCitation = 100
        this.downloadsPerAuthorship = 10

        // showing subrs
        this.showDocdel = false


        // subscriptions
        this.subrs = {
            fullSubscription: [],
            ill: [],
            docdel: [],
        }
        this.subrDict = {}

        this.hash = "foo"
        this.defaultSubr = "ill"

        // cache
        this.cache = {}

        // sorting journals
        this.journalSorter = new JournalSorter()
    }

    setSubr(issnl, subrName){
        this.subrDict[issnl] = subrName
        const str = "salt" + JSON.stringify(this.subrDict)
        this.hash =  hashCode(str)
        this.clearCacheIssnl(issnl)
        return

    }
    getSubr(issnl){
        return this.subrDict[issnl] || this.defaultSubr
    }
    isSubscribed(issnl){
        return this.subrDict[issnl] === "fullSubscription"
    }


    getCache(issnl, subrName, fnName){
        if (this.cache[issnl]
            && this.cache[issnl][subrName]
            && this.cache[issnl][subrName][fnName]){
            return this.cache[issnl][subrName][fnName]
        }
    }

    setCache(issnl, subrName, fnName, value){
        if (!this.cache[issnl]) this.cache[issnl] = {}
        if (!this.cache[issnl][subrName]) this.cache[issnl][subrName] = {}
        this.cache[issnl][subrName][fnName] = value
    }
    clearCacheIssnl(issnl){
        this.cache[issnl] = {}
    }
    clearCache(){
        this.cache = {}
    }

    getList(){
        return Object.entries(displayNames).map(([k, v])=>{
            return {
                name: k,
                displayName: v,
                val: this[k]
            }
        })
    }
    setFromList(myList){
        this.clearCache()
        myList.forEach(setting=>{
            this[setting.name] = parseFloat(setting.val)
        })

    }

}
