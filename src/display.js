const usageColors = {
    softTurnaway: "#669395",
    ill: "#4f38ff",
    docdel: "#2196f3", // blue 500
    fullSubscription: "#00b3b1", // cyan 600
    backCatalog: "#558b2f", // light green 700
    oa: "#00b200", // light green 700
    rg: "#45a559",  // custom from light green
}
const usageFillColors = {
    ...usageColors,
    fullSubscription: "#00b3b1",
    // softTurnaway: "#bbbbbb"
}

const sortOrder = {
    softTurnaway: 1,
    fullSubscription: 2,
    docdel: 3,
    ill: 4,
    backCatalog: 5,
    oa: 6,
    rg: 7,
}


const usageDisplayNames = {
    softTurnaway: "Other delayed",
    ill: "ILL",
    docdel: "DocDel",
    fullSubscription: "Subscription",
    backCatalog: "Back catalog",
    oa: "Open Access",
    rg: "ResearchGate",
}

const sorter = function(a, b){
    return sortOrder[a.name] - sortOrder[b.name]
}


const barSegmentLabels = function () {
    const ret = Object.keys(usageColors).map(k=>{
        return {
            name: k,
            fillColor: usageFillColors[k],
            color: usageColors[k],
            displayName: usageDisplayNames[k]
        }
    }).filter(x=>x.name !== 'docdel')

    ret.sort(sorter)
    return ret
}



const barSegments = function (dataDict) {
    const total = Object.values(dataDict).reduce((a, b) => a + b)
    let ret = Object.entries(dataDict).map(([k, v]) => {
        return {
            name: k,
            count: v,
            perc: 100 * v / total,
            fillColor: usageFillColors[k],
            color: usageColors[k],
            displayName: usageDisplayNames[k]
        }
    }).filter(x=>x.name !== 'docdel')
    ret.sort(sorter)
    return ret
}
const color = function (k) {
    return usageColors[k]
}
const displayName = function (k) {
    return usageDisplayNames[k]
}


export {
    barSegments,
    barSegmentLabels,
    color,
    displayName,
}