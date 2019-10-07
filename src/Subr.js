import _ from "lodash";


function lighten(hex, amount) {
    if (hex === "transparent") return "transparent"


    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const rgb = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    }
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${amount})`
}


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


class BaseSubrYear {
    constructor(userSettings, cost, year) {
        this.userSettings = userSettings
        this.userSettings = userSettings
        this.year = year


        this.usage = {
            softTurnaway: 0,
            fullSubscription: 0,
            docdel: 0,
            ill: 0,
            backCatalog: 0,
            oa: 0
        }
        this.count = 0 // keep track of how times we've added a subscription
        this.name = null

        // @todo move this into the module to save memory
        this.usageSortOrder = {
            softTurnaway: 1,
            ill: 2,
            docdel: 2.5,
            fullSubscription: 3,
            backCatalog: 4,
            oa: 5,
        }

        this.colors = {
            tile: "transparent",
            tileBorder: "transparent"
        }

    }

    costPerPaidUse() {
        return (this.cost / this.paidUseCount()) || 0
    }

    paidUseCount() {
        return this.usage.fullSubscription + this.usage.docdel + this.usage.ill
    }

    freeUseCount() {
        return this.usage.oa + this.usage.backCatalog
    }

    useCount() {
        return _.sum(Object.values(this.usage))
    }

    getCostForUsageType(useType) {
        return (this.name === useType) ? this.cost : 0
    }


    getUseCount() {
        return _.sum(Object.values(this.usage))
    }

    getUseCountAdjusted() {
        return this.useCount() - this.freeUseCount()
    }

    getUseCountAdjustmentPerc() {
        return this.getUseCountAdjusted() / this.getUseCount()
    }

    getCostPerUseAdj() {
        return this.cost / this.getUseCountAdjusted()
    }

    getColor(name, makeLight) {
        const color = this.colors[name]
        if (makeLight) {
            return lighten(color, .05)
        } else {
            return color
        }
    }

    getFillColor() {
        return this.colors.primary
    }

    getPrimaryColor() {
        return this.colors.primary
    }


    getUsageStats() {
        const useCount = this.useCount()
        const ret = Object.entries(this.usage).map(([k, v]) => {
            const costForThisUseType = this.getCostForUsageType(k)
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
        })

        ret.sort((a, b) => {
            return this.usageSortOrder[a.name] - this.usageSortOrder[b.name]
        })

        return ret

    }

    addSubscriptionObj(subscription) {
        if (subscription.name !== this.name) {
        }
        Object.entries(subscription.usage).forEach(([k, v]) => {
            this.usage[k] += v
        })
        this.cost += subscription.cost
        this.count += 1
    }


}


class FullSubrYear extends BaseSubrYear {
    constructor(userSettings, cost, year) {
        super(userSettings, cost, year)
        this.name = "full"
        this.displayName = "Subscription"
        this.colors = {
            tile: usageColors.fullSubscription,
            tileBorder: "transparent",
            primary: usageColors.fullSubscription
        }
    }

    set(apiUsageStats, cost) {
        const total = apiUsageStats.useCount
        const free = apiUsageStats.oaUseCount + apiUsageStats.backCatalogUseCount
        const nonFree = total - free


        this.usage = {
            softTurnaway: 0,
            fullSubscription: nonFree,
            docdel: 0,
            ill: 0,
            oa: apiUsageStats.oaUseCount || 0,
            backCatalog: apiUsageStats.backCatalogUseCount || 0
        }

        this.cost = cost || 0
        this.count = 1
    }

    setUsage(apiUsageStats) {
        const total = apiUsageStats.useCount
        const free = apiUsageStats.oaUseCount + apiUsageStats.backCatalogUseCount
        const nonFree = total - free
        this.usage = {
            softTurnaway: 0,
            fullSubscription: nonFree,
            docdel: 0,
            ill: 0,
            oa: apiUsageStats.oaUseCount || 0,
            backCatalog: apiUsageStats.backCatalogUseCount || 0
        }

        this.count = 1
    }

}

class DocdelSubrYear extends BaseSubrYear {
    constructor(userSettings, cost, year) {
        super(userSettings, cost, year)
        this.name = "docdel"
        this.displayName = "DocDel"
        this.colors = {
            tile: usageFillColors.softTurnaway,
            tileBorder: usageColors.docdel,
            primary: usageColors.docdel,
        }
    }


    setUsage(apiUsageStats) {
        const total = apiUsageStats.useCount
        const free = apiUsageStats.oaUseCount + apiUsageStats.backCatalogUseCount
        const turnaway = total - free
        const hardTurnawayCount = turnaway * this.userSettings.hardTurnawayProp

        this.usage = {
            softTurnaway: Math.round(turnaway - hardTurnawayCount),
            fullSubscription: 0,
            docdel: hardTurnawayCount,
            ill:0,
            oa: apiUsageStats.oaUseCount || 0,
            backCatalog: apiUsageStats.backCatalogUseCount || 0
        }

        this.count = 1
    }


    costPerPaidUse() {
        return this.userSettings.docDelCostPerUse
    }

    getCostPerUseAdj() {
        return this.userSettings.docDelCostPerUse * this.userSettings.hardTurnawayProp
    }


}

class IllSubrYear extends BaseSubrYear {
    constructor(userSettings, cost, year) {
        super(userSettings, cost, year)
        this.name = "ill"
        this.displayName = "ILL"
        this.colors = {
            tile: usageFillColors.softTurnaway,
            tileBorder: usageColors.ill,
            primary: usageColors.ill,
        }
    }


    setUsage(apiUsageStats) {
        const total = apiUsageStats.useCount
        const free = apiUsageStats.oaUseCount + apiUsageStats.backCatalogUseCount
        const turnaway = total - free
        const hardTurnawayCount = turnaway * this.userSettings.hardTurnawayProp

        this.usage = {
            softTurnaway: Math.round(turnaway - hardTurnawayCount),
            fullSubscription: 0,
            docdel: 0,
            ill:hardTurnawayCount,
            oa: apiUsageStats.oaUseCount || 0,
            backCatalog: apiUsageStats.backCatalogUseCount || 0
        }

        this.count = 1
    }

    costPerPaidUse() {
        return this.userSettings.illCostPerUse
    }

    getCostPerUseAdj() {
        return this.userSettings.illCostPerUse * this.userSettings.hardTurnawayProp
    }

}


const makeBlankSubscriptions = function (year) {
    const ret = [
        new FullSubrYear(),
        new DocdelSubrYear(),
        new IllSubrYear(),
    ]
    ret.forEach(x => {
        x.year = year
    })

    return ret
}


// @todo this is broken now
const makeSubscriptions = function (apiUsageStats, cost, year) {
    const full = new FullSubrYear()
    full.set(apiUsageStats, cost)
    full.year = year

    return [
        full,
        new DocdelSubrYear(full),
        new IllSubr(full),
    ]
}

const makeSubrYear = function (subrName, userSettings, cost, year) {
    const classes = {
        full: FullSubrYear,
        docdel: DocdelSubrYear,
        ill: IllSubrYear
    }
    const mySubr = new classes[subrName](userSettings, cost, year)
    return mySubr

}


const makeSubrMenu = function () {
    const blanks = makeBlankSubscriptions()
    return blanks.map(subr => {
        return {
            name: subr.name,
            displayName: subr.displayName,
            color: subr.getPrimaryColor(),
            fillColor: subr.getFillColor()
        }
    })
}


export {
    makeSubrYear,
    usageColors,
    makeSubrMenu,
    makeSubrYear,
}














