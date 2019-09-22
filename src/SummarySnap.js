import {BaseSnap, makeBlankMods} from "./BaseSnap"


export default class SummarySnap extends BaseSnap{
    constructor(snaps) {
        super()
        this.snaps = snaps || []
    }

    addSnap(snap){
        this.snaps.push(snap)
    }


    getRawUses() {
        const ret = makeBlankMods()

        this.snaps.forEach(snap => {
            const myUses = snap.getRawUses()
            Object.keys(myUses).forEach(k => {

                ret[k].count += myUses[k].count
                ret[k].cost += myUses[k].cost
            })
        })

        return ret
    }
}

