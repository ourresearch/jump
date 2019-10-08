



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



const barSegments = function(dataDict){
    const total = Object.values(dataDict).reduce((a,b)=>a+b)
    return Object.entries(dataDict).map(([k,v])=>{
        return {
            name: k,
            count: v,
            perc: 100 * v / total,
            fillColor: usageFillColors[k],
            displayName: usageDisplayNames[k]
        }
    })
}
const color = function(k){
    return usageColors[k]
}



export {
    barSegments,
    color,
}