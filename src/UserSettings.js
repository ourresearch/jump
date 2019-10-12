


const displayNames = {
    docDelCostPerUse: "DocDel transaction cost",
    illCostPerUse: "ILL transaction cost",
    hardTurnawayProp: "ILL/DocDel request percentage",
    bigDealCostAnnualIncrease: "Big Deal cost % annual increase",
    subrCostAnnualIncrease: "A-la-carte subscription cost % annual increase",
    bigDealCost: "Big Deal annual cost",

    downloadsPerCitation: "Downloads to add for each citation",
    downloadsPerAuthorship: "Downloads to add for each authorship",
}

export default class UserSettings {
    constructor(){
        // item-level acquisition
        this.docDelCostPerUse = 25
        this.illCostPerUse = 5
        this.hardTurnawayProp = 0.5

        // cost: annual increase
        this.bigDealCostAnnualIncrease = 0.05
        this.subrCostAnnualIncrease = 0.08

        // cost
        this.bigDealCost = 2000000

        // impact
        this.downloadsPerCitation = 0
        this.downloadsPerAuthorship = 0
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
        myList.forEach(setting=>{
            this[setting.name] = parseFloat(setting.val)
        })

    }

}
