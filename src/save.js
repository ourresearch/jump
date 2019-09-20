
const getCost = function(stat, subscriptionName){
    const docdelCount = subscriptionCounts(subscriptionName)(stat).find(x=>x.name==='docdel')

    const ret = ({
        free: 0,
        fullSubscription:stat.subscriptionPrice,
        docdel: docDelPricePerUse * docdelCount
    })[subscriptionName]

    return ret
}





function useReportTest(stat, subscriptionName){

    subscriptionName = "docdel"

    const cost = getCost(stat, subscriptionName)
    const useCounts = subscriptionCounts(subscriptionName)(stat)
    const getContext = countContext(stat.useCount, cost)

    const mods = useCounts.map(useDict=>{
        return Object.assign(
            {},
            useDict,
            getContext(useDict.count),
            // useTypeConfigs(useDict.name)
            )
    })

    console.log("subscription counts", mods)

}



function subscriptionCounts(subscriptionName) {
    return function (stat) {
        const freeCount = stat.oaUseCount + stat.backCatalogUseCount
        const nonFreeCount = stat.useCount - freeCount

        const subscriptionCounts = {
            docdel: nonFreeCount * hardTurnawayProp,
            fullSubscription: nonFreeCount,
            free: 0
        }
        const useCounts = {
            oa: stat.oaUseCount,
            backCatalog: stat.backCatalogUseCount,
        }
        useCounts[subscriptionName] = subscriptionCounts[subscriptionName]

        if (!useCounts.docdel) {
            useCounts.softTurnaway = subscriptionCounts.docdel
        }
        useCounts.hardTurnaway = stat.useCount - Object.values(useCounts).reduce((a,b) => a+b)
        return Object.entries(useCounts).map((entry)=>{
            return {name: entry[0], count: entry[1]}
        })
    }
}

const countContext = function(totalCount, totalPrice){
    return function(num){
        return {
            prop: num / totalCount,
            pricePerCount: totalPrice / num
        }
    }
}



function useTypeConfigs(name){
    return ({
        oa: {
            name: "oa",
            color: "#43a047",
        },
        backCatalog: {
            name: "backCatalog",
            color: "#c0ca33",
        },
        fullSubscription: {
            name: "fullSubscription",
            color: "#ef5350",
        },
        docdel: {
            name: "fullSubscription",
            color: "#ff7043",
        },
        hardTurnaway: {
            name: "hardTurnaway",
            color: "#999",
        },
        softTurnaway: {
            name: "softTurnaway",
            color: "#555",
        },
    })[name]
}
