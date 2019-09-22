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
        const mods = makeBlankMods()

        this.snaps.forEach(snap => {
            const myUses = snap.getUses()
            Object.keys(myUses).forEach(k => {
                mods[k].count += myUses[k].count
                mods[k].price += myUses[k].price
            })
        })

        return mods
    }
}

