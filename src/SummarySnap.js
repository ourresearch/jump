import {BaseSnap, makeBlankMods} from "./BaseSnap"


export default class SummarySnap extends BaseSnap{
    constructor(snaps) {
        super()
        this.snaps = snaps || []
    }

    addSnap(snap){
        this.snaps.push(snap)
    }

    getUses(){
        console.log("SummarySnap.getUses()", this.snaps)


        const mods = makeBlankMods()

        this.snaps.forEach(snap=>{
            const myUses = snap.getUses()
            Object.keys(myUses).forEach(k=>{
                mods[k].count += myUses[k].count
                mods[k].price += myUses[k].price
            })
        })

        const totalCount = Object.values(mods).map(x=>x.count).reduce((a,b)=>a+b)
        const ret = this._addSummaryStats(mods, totalCount)

        return ret
    }

    _addSummaryStats(modsDict, totalCount) {
        const ret = {...modsDict}
        Object.keys(ret).forEach(k => {
            ret[k].prop = ret[k].count / totalCount
            ret[k].pricePerCount = ret[k].price / ret[k].count
        })
        return ret
    }

}

