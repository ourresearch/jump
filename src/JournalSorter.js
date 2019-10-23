export default class JournalSorter {
    constructor(){
        this.sorters = [
                {text: "Best Cost Per Paywalled Use", name: "bestCpnu"},
                // {text: "Best Cost Per Negotiable Use (no ILL)", name: "bestCpnuNoIll"},
                {text: "Total usage", name: "totalUsage", isDescending: true, isSelected: true},
                {text: "Title", name: "title"},
                {text: "Citations", name: "citations", isDescending: true},

            ]
    }

    setSorter(name){
        this.sorters.forEach(s=>s.isSelected=false)
        this.sorters.find(x=>x.name===name).isSelected = true
    }
    getSelectedSorter(){
        return this.sorters.find(x=>x.isSelected)
    }
    sortJournals(journals){
        const ret = [...journals]
        const mySorter = this.getSelectedSorter()

        const sortFn = function (a, b) {
            let ret = 0
            const aVal = a.getSortFn(mySorter.name)()
            const bVal = b.getSortFn(mySorter.name)()
            if (aVal < bVal) {
                ret = -1
            } else {
                ret = 1
            }
            if (mySorter.isDescending) ret = -ret
            return ret
        }
        ret.sort(sortFn)
        return ret
    }



}