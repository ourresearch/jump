const usageColors = {
    softTurnaway: "#666666", // blue grey 100
    ill: "#7e57c2", // deep purple 400
    docdel: "#2196f3", // blue 500
    fullSubscription: "#00acc1", // cyan 600
    backCatalog: "#43a047", // green 600
    oa: "#558b2f", // light green 700
}
const usageFillColors = {
    ...usageColors,
    softTurnaway: "#bbbbbb"
}


const usageDisplayNames = {
    softTurnaway: "Soft turnaway",
    ill: "ILL",
    docdel: "DocDel",
    fullSubscription: "Subscription",
    backCatalog: "Back catalog",
    oa: "Open Access",
}


const makeUsageStat = function (name, count, totalUsage) {
    return {
        name: k,
        displayName: usageDisplayNames[k],
        count: v,
        color: usageColors[k],
        fillColor: usageFillColors[k],
        perc: 100 * v / useCount,
        cost: costForThisUseType,
        costPerCount: (costForThisUseType / v) || 0 // fix division by 0
    }
}

const makeUsageStats = function (usageCounts) {
    const total = Object.values(usageCounts).reduce((a,b)=>a+b)

    return Object.values(usageCounts).map(([k, v]) => {
        return {
            name: k,
            displayName: usageDisplayNames[k],
            count: v,
            color: usageColors[k],
            fillColor: usageFillColors[k],
            perc: 100 * v / total
        }

    })
}

export {
    makeUsageStats,
    usageColors
}