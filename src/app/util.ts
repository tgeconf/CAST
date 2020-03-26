import { ChartSpec, TimingSpec, Animation } from 'canis_toolkit'
import { state } from './state'
import Tool from '../util/tool'
import { ISortDataAttr, IDataItem, IDataDatumType, IKeyframeGroup, IKeyframe } from './ds';
import AttrSort from '../components/widgets/attrSort';
import KfTimingIllus from '../components/widgets/kfTimingIllus';
import KfItem from '../components/widgets/kfItem';

export default class Util {
    static attrType: IDataDatumType = {};
    static NUMERIC_ATTR: string = 'numeric';
    static CATEGORICAL_ATTR: string = 'categorical';
    static DATA_SUGGESTION: string = 'dataSuggestion';
    static NON_DATA_SUGGESTION: string = 'nonDataSuggestion';
    static NO_SUGGESTION: string = 'noSuggestion';
    static NUMERIC_CATEGORICAL_ATTR: string[] = ['Year', 'year', 'Month', 'month', 'Day', 'day'];
    static EFFECTIVENESS_RANKING: string[] = ['position', 'color', 'shape'];
    static EXCLUDED_DATA_ATTR: string[] = ['_TYPE', 'text', '_x', '_y', '_id', '_MARKID'];

    static filteredDataTable: Map<string, IDataItem> = new Map();//markId, dataItem
    static nonDataTable: Map<string, IDataItem> = new Map();//markId, non dataitem (for axis, legend, title)

    /**
     * based on selected marks, judge perfrom which kind of suggestion
     * @param markIds 
     */
    public static judgeSuggestionType(markIds: string[]): string {
        const allDataEncodedMarks: string[] = Array.from(this.filteredDataTable.keys());
        const allNonDataEncodedMarks: string[] = Array.from(this.nonDataTable.keys());
        let containDataMark: boolean = false, containNonDataMark: boolean = false;
        for (let i = 0, len = markIds.length; i < len; i++) {
            if (allDataEncodedMarks.includes(markIds[i])) {
                containDataMark = true;
                if (containNonDataMark) {
                    break;
                }
            } else if (allNonDataEncodedMarks.includes(markIds[i])) {
                containNonDataMark = true;
                if (containDataMark) {
                    break;
                }
            }
        }
        if (containDataMark && !containNonDataMark) {
            return this.DATA_SUGGESTION;
        } else if (!containDataMark && containNonDataMark) {
            return this.NON_DATA_SUGGESTION;
        } else {
            return this.NO_SUGGESTION;
        }
    }

    /**
     * suggest based on selected marks
     * @param markIds : selected marks
     */
    public static suggestSelection(markIds: string[]): string[] {
        const suggestionType: string = this.judgeSuggestionType(markIds);
        switch (suggestionType) {
            case this.DATA_SUGGESTION:
                return this.suggestSelBasedOnData(markIds);
            case this.NON_DATA_SUGGESTION:
                return this.suggestSelBasedOnChart(markIds);
            default:
                return markIds;
        }
    }

    /**
     * the selected marks are data encoded marks
     */
    public static suggestSelBasedOnData(markIds: string[]): string[] {
        //find the same and diff attributes of the selected marks
        const [sameAttrs, diffAttrs] = this.compareAttrs(markIds);
        //filter attributes according to the effectiveness ranking
        const filteredDiffAttrs = this.filterAttrs(diffAttrs);
        console.log('found same and diff attrs: ', sameAttrs, diffAttrs);
        //list all data-encoded marks
        let allMarkIds: string[] = Array.from(this.filteredDataTable.keys());
        // this.filteredDataTable.forEach((datum, markId) => {
        //     allMarkIds.push(markId);
        // })
        const [sections, orderedSectionIds] = this.partitionChart(sameAttrs, filteredDiffAttrs, allMarkIds);

        //judge if marks from one section are selected all, otherwise repeat selection with the one with the most selected marks
        let allSelected: boolean = false, mostSelectionNumInSec: number = 0;
        sections.forEach((marksInSec, secId) => {
            allSelected = Tool.arrayContained(markIds, marksInSec) || allSelected;//whether marks in this section are all selected
            let tmpCount: number = 0;
            marksInSec.forEach((mId) => {
                if (markIds.includes(mId)) {
                    tmpCount++;
                }
            })
            mostSelectionNumInSec = tmpCount > mostSelectionNumInSec ? tmpCount : mostSelectionNumInSec;
        })
        console.log('allselected: ', allSelected, mostSelectionNumInSec);

        //for each section, select the same most number of marks or all of the marks
        //create container for each section, and push in the selected marks first
        let selAndSug: Map<string, Set<string>> = new Map();
        markIds.forEach((markId) => {
            let sectionId: string = '';
            [...sameAttrs, ...filteredDiffAttrs].forEach((attr) => {
                // sectionId += ChartSpec.dataMarkDatum.get(markId)[attr] + ',';
                sectionId += this.filteredDataTable.get(markId)[attr] + ',';
            })
            if (typeof selAndSug.get(sectionId) === 'undefined') {
                selAndSug.set(sectionId, new Set());
            }
            selAndSug.get(sectionId).add(markId);
        })
        console.log('selection and suggestion before: ', selAndSug);

        //find suggestion
        let valueOfSameAttrs: string[] = [];
        sameAttrs.forEach((sAttr) => {
            valueOfSameAttrs.push(this.filteredDataTable.get(markIds[0])[sAttr].toString());
            // valueOfSameAttrs.push(ChartSpec.dataMarkDatum.get(markIds[0])[sAttr]);
        })
        sections.forEach((marksInSec, secId) => {
            marksInSec.forEach((mId) => {
                if (filteredDiffAttrs.length > 0) {//there are diff categorical attrs
                    if (typeof selAndSug.get(secId) === 'undefined') {
                        selAndSug.set(secId, new Set());
                    }

                    if (allSelected) {
                        //only those sections with the same attributes as the selected marks
                        let blocks = secId.split(',');
                        if (Tool.arrayContained(blocks, valueOfSameAttrs)) {
                            selAndSug.get(secId).add(mId);
                        }
                    } else {
                        if (selAndSug.get(secId).size < mostSelectionNumInSec) {
                            //judge if this mark has the same attr value
                            let hasSameVal: boolean = true;
                            for (let j = 0, len2 = sameAttrs.length; j < len2; j++) {
                                // if (ChartSpec.dataMarkDatum.get(mId)[sameAttrs[j]] !== ChartSpec.dataMarkDatum.get(markIds[0])[sameAttrs[j]]) {
                                if (this.filteredDataTable.get(mId)[sameAttrs[j]] !== this.filteredDataTable.get(markIds[0])[sameAttrs[j]]) {
                                    hasSameVal = false;
                                    break;
                                }
                            }
                            if (hasSameVal) {
                                selAndSug.get(secId).add(mId);
                            }
                        }
                    }
                } else if (filteredDiffAttrs.length === 0 && markIds.length > 1) {//there are no diff categorical attrs && selected more than 1 mark
                    let hasSameVal: boolean = true;
                    for (let j = 0, len2 = sameAttrs.length; j < len2; j++) {
                        // if (ChartSpec.dataMarkDatum.get(mId)[sameAttrs[j]] !== ChartSpec.dataMarkDatum.get(markIds[0])[sameAttrs[j]]) {
                        if (this.filteredDataTable.get(mId)[sameAttrs[j]] !== this.filteredDataTable.get(markIds[0])[sameAttrs[j]]) {
                            hasSameVal = false;
                            break;
                        }
                    }
                    if (hasSameVal) {
                        selAndSug.get(secId).add(mId);
                    }
                }
            })
        })
        console.log('selection and suggestion after: ', selAndSug);

        //add suggestion result to the selected marks
        let selectedMarks: string[] = [];
        selAndSug.forEach((selAndSugMarks, secId) => {
            selectedMarks.push(...selAndSugMarks);
        })
        console.log('final sugestion: ', selectedMarks);
        return selectedMarks;
    }

    /**
     * the selected marks are non data encoded marks
     */
    public static suggestSelBasedOnChart(markIds: string[]): string[] {
        console.log(this.nonDataTable);
        return markIds;
    }

    /**
     * partition the chart according to the given attributes when doing data-driven suggestion
     * @param sameAttr 
     * @param filteredDiffAttrs 
     * @param markIds 
     * @param hasOneMark 
     */
    public static partitionChart(
        sameAttrs: string[],
        filteredDiffAttrs: string[],
        markIds: string[],
        hasOneMark: boolean = false): [Map<string, string[]>, string[]] {
        let sections = new Map();
        let sectionIdRecord: string[][] = [];

        markIds.forEach((markId) => {
            let sectionId: string = '';
            let seperateSecId: string[] = [];//for ordering section ids
            [...sameAttrs, ...filteredDiffAttrs].forEach((attr) => {
                // sectionId += ChartSpec.dataMarkDatum.get(markId)[attr] + ',';
                // seperateSecId.push(ChartSpec.dataMarkDatum.get(markId)[attr]);
                sectionId += this.filteredDataTable.get(markId)[attr] + ',';
                seperateSecId.push(this.filteredDataTable.get(markId)[attr].toString());
            })
            if (hasOneMark) {
                sectionId += markId + ',';
                seperateSecId.push(markId);
            }
            if (typeof sections.get(sectionId) === 'undefined') {
                sections.set(sectionId, []);
                sectionIdRecord.push(seperateSecId);
            }
            sections.get(sectionId).push(markId);
        })

        //order section ids
        sectionIdRecord.sort((a, b) => {
            let diffValueIdx = 0;
            for (let i = 0, len = [...sameAttrs, ...filteredDiffAttrs].length; i < len; i++) {
                if (a[i] !== b[i]) {
                    diffValueIdx = i;
                    break;
                }
            }
            if (b[diffValueIdx] > a[diffValueIdx]) {
                return -1;
            } else {
                return 1;
            }
        })
        const orderedSectionIds = sectionIdRecord.map(a => a.join(',') + ',');
        console.log('partition sections: ', sections);
        return [sections, orderedSectionIds];
    }

    /**
     * filter attributes according to the effectiveness ranking
     * @param attrs 
     */
    public static filterAttrs(attrs: string[]) {
        let filteredAttrs = [];
        let typeRecorder = '';
        for (let i = 0, len = this.EFFECTIVENESS_RANKING.length; i < len; i++) {
            for (let j = 0, len2 = attrs.length; j < len2; j++) {
                let tmpAttrType = ChartSpec.chartUnderstanding[attrs[j]];
                if (tmpAttrType === this.EFFECTIVENESS_RANKING[i] && (tmpAttrType === typeRecorder || typeRecorder === '')) {
                    filteredAttrs.push(attrs[j]);
                    typeRecorder = tmpAttrType;
                }
            }
        }
        return filteredAttrs;
    }

    /**
     * compare attributes of the selected marks, find the same and different attributes
     * @param markIds 
     * @param markData 
     */
    public static compareAttrs(markIds: string[]): string[][] {
        let sameAttr: string[] = [], diffAttrs: string[] = [];
        for (let attrName in this.attrType) {
            let sameAttrType = true;
            const firstMarkType = this.filteredDataTable.get(markIds[0])[attrName];
            for (let i = 1, len = markIds.length; i < len; i++) {
                // if (ChartSpec.dataMarkDatum.get(markIds[i])[attrName] !== firstMarkType) {
                if (this.filteredDataTable.get(markIds[i])[attrName] !== firstMarkType) {
                    sameAttrType = false;
                    break;
                }
            }
            if (!this.EXCLUDED_DATA_ATTR.includes(attrName) && this.attrType[attrName] === this.CATEGORICAL_ATTR) {
                if (sameAttrType) {
                    sameAttr.push(attrName);
                } else if (!sameAttrType) {
                    diffAttrs.push(attrName);
                }
            }
        }
        return [sameAttr, diffAttrs];
    }

    /**
     * determine the attribute type of the data attributes of marks
     * @param markData 
     */
    public static extractAttrValueAndDeterminType(markData: Map<string, IDataItem>) {
        this.filteredDataTable.clear();
        this.attrType = {};
        markData.forEach((dataDatum: IDataItem, markId: string) => {
            let tmpDataItem: IDataItem = {};
            for (const key in dataDatum) {
                let tmpAttrType: string = (!isNaN(Number(dataDatum[key])) && dataDatum[key] !== '') ? this.NUMERIC_ATTR : this.CATEGORICAL_ATTR;
                this.attrType[key] = tmpAttrType;
                if (!this.EXCLUDED_DATA_ATTR.includes(key)) {
                    tmpDataItem[key] = dataDatum[key];
                }
            }
            this.filteredDataTable.set(markId, tmpDataItem);
        })
    }

    public static extractNonDataAttrValue(markData: Map<string, IDataItem>) {
        this.nonDataTable.clear();
        markData.forEach((dataDatum: IDataItem, markId: string) => {
            let tmpDataItem: IDataItem = {};
            for (const key in dataDatum) {
                
                tmpDataItem[key] = dataDatum[key];
            }
            this.nonDataTable.set(markId, tmpDataItem);
        })
    }

    public static filterDataSort(dataSort: ISortDataAttr[]): ISortDataAttr[] {
        return dataSort.filter(ds => !Util.EXCLUDED_DATA_ATTR.includes(ds.attr));
    }

    /**
     * find out to sort with which attr
     */
    public static findUpdatedAttrOrder(sda: ISortDataAttr[]) {
        let result: ISortDataAttr = { attr: '', sort: '' };
        for (let i = 0, len = state.sortDataAttrs.length; i < len; i++) {
            let found: boolean = false;
            for (let j = 0; j < len; j++) {
                if (sda[j].attr === state.sortDataAttrs[i].attr) {
                    found = sda[j].sort !== state.sortDataAttrs[i].sort;
                    if (found) {
                        result.attr = sda[j].attr;
                        result.sort = sda[j].sort;
                        break;
                    }
                }
            }
            if (found) {
                break;
            }
        }
        return result;
    }
    public static sortDataTable(attrOrder: ISortDataAttr): string[] {
        let result: string[] = [];
        if (attrOrder.attr !== '') {
            switch (attrOrder.sort) {
                case AttrSort.INDEX_ORDER:
                    result = Array.from(state.dataTable.keys());
                    result.sort((a, b) => {
                        const aNum: number = parseInt(a.substring(4));
                        const bNum: number = parseInt(b.substring(4));
                        return aNum < bNum ? -1 : 1;
                    })
                    break;
                case AttrSort.ASSCENDING_ORDER:
                case AttrSort.DESCENDING_ORDER:
                    let arrToOrder: string[][] = [];
                    state.dataTable.forEach((datum, markId) => {
                        arrToOrder.push([markId, datum[attrOrder.attr].toString()]);
                    })
                    arrToOrder.sort((a, b) => {
                        const compareA: string | number = !isNaN(Number(a[1])) ? Number(a[1]) : a[1];
                        const compareB: string | number = !isNaN(Number(b[1])) ? Number(b[1]) : b[1];
                        if (attrOrder.sort === AttrSort.ASSCENDING_ORDER)
                            return compareA < compareB ? -1 : 1;
                        else
                            return compareA > compareB ? -1 : 1;
                    })
                    result = arrToOrder.map(a => a[0]);
                    break;
            }
        }
        return result;
    }
    public static aniRootToKFGroup(aniunitNode: any, aniId: string, parentObj: {} | IKeyframeGroup, parentChildIdx: number): IKeyframeGroup {
        console.log('aniunit node: ', aniunitNode);
        let kfGroupRoot: IKeyframeGroup = {
            groupRef: aniunitNode.groupRef,
            id: aniunitNode.id,
            aniId: aniId,
            // parentObj: parentObj,
            marks: aniunitNode.marks,
            timingRef: aniunitNode.timingRef,
            delay: aniunitNode.delay,
            delayIcon: (typeof aniunitNode.offset !== 'undefined' && aniunitNode.offset !== 0) || (aniunitNode.delay > 0 && parentChildIdx > 0),
            newTrack: (typeof aniunitNode.align === 'undefined' && aniunitNode.groupRef === 'root')
                || (aniunitNode.timingRef === TimingSpec.timingRef.previousStart && parentChildIdx !== 0)
        }
        console.log(aniId, 'new track: ', kfGroupRoot.newTrack);
        KfTimingIllus.updateOffsetRange(aniunitNode.delay);
        if (typeof aniunitNode.offset !== 'undefined') {
            kfGroupRoot.delay = aniunitNode.offset;
            // kfGroupRoot.offset = aniunitNode.offset;
            // kfGroupRoot.offsetIcon = aniunitNode.offset > 0;
            KfTimingIllus.updateOffsetRange(aniunitNode.offset);
        }
        if (typeof aniunitNode.align !== 'undefined') {
            kfGroupRoot.alignType = aniunitNode.align.type;
            kfGroupRoot.alignTarget = aniunitNode.align.target;
        }
        kfGroupRoot.children = [];
        kfGroupRoot.keyframes = [];
        if (aniunitNode.children.length > 0) {
            if (aniunitNode.children[0].children.length > 0) {
                let childrenIsGroup: boolean = true;
                if (typeof aniunitNode.children[0].children[0].definedById !== 'undefined') {
                    if (!aniunitNode.children[0].children[0].definedById) {
                        childrenIsGroup = false;
                    }
                }
                if (childrenIsGroup) {
                    aniunitNode.children.forEach((c: any, i: number) => {
                        const kfGroupChild: IKeyframeGroup = this.aniRootToKFGroup(c, aniId, kfGroupRoot, i);
                        kfGroupRoot.children.push(kfGroupChild);
                    })
                } else {
                    const judgeMerge: any = this.mergeNode(aniunitNode.children);
                    if (!judgeMerge.merge) {
                        aniunitNode.children.forEach((k: any, i: number) => kfGroupRoot.keyframes.push(this.aniLeafToKF(k, i, aniId, kfGroupRoot, kfGroupRoot.marks)))
                    } else {
                        kfGroupRoot.keyframes.push(this.aniLeafToKF(judgeMerge.mergedNode, 0, aniId, kfGroupRoot, kfGroupRoot.marks));
                    }
                }
            } else {//children are keyframes
                const judgeMerge: any = this.mergeNode(aniunitNode.children);
                if (!judgeMerge.merge) {
                    aniunitNode.children.forEach((k: any, i: number) => kfGroupRoot.keyframes.push(this.aniLeafToKF(k, i, aniId, kfGroupRoot, kfGroupRoot.marks)))
                } else {
                    kfGroupRoot.keyframes.push(this.aniLeafToKF(judgeMerge.mergedNode, 0, aniId, kfGroupRoot, kfGroupRoot.marks));
                }
            }
        }
        return kfGroupRoot;
    }

    /**
     * if children start and end at the same time, merge them into one node
     * @param children 
     */
    public static mergeNode(children: any[]): { merge: boolean, mergedNode?: any } {
        console.log('testing merge: ', children);
        let merge: boolean = true;
        for (let i = 0, len = children.length; i < len; i++) {
            const c: any = children[i];
            if (c.start !== children[0].start || c.end !== children[0].end) {
                merge = false;
                break;
            }
        }

        if (merge) {
            children.forEach((c: any) => {
                children[0].marks = [...children[0].marks, ...c.marks];
            })
            return { merge: true, mergedNode: children[0] }
        }

        return { merge: false };
    }

    /**
     * 
     * @param aniLeaf 
     * @param leafIdx : leaf index in its parent, need this to determine whether to draw offset or not
     * @param aniId 
     * @param parentId 
     */
    public static aniLeafToKF(aniLeaf: any, leafIdx: number, aniId: string, parentObj: IKeyframeGroup, parentMarks: string[]): IKeyframe {
        //find the min and max duraion of kfs, in order to render kfs
        const tmpDuration: number = aniLeaf.end - aniLeaf.start;
        KfTimingIllus.updateDurationRange(tmpDuration);
        if (leafIdx > 0) {//delay
            KfTimingIllus.updateOffsetRange(aniLeaf.delay);
        }
        //find all the marks animate before marks in aniLeaf
        const marksInOrder: string[] = Animation.animations.get(aniId).marksInOrder;
        let targetIdx: number = 0;
        let minStartTime: number = 1000000;
        aniLeaf.marks.forEach((m: string) => {
            const tmpIdx: number = marksInOrder.indexOf(m);
            if (tmpIdx > targetIdx) {
                targetIdx = tmpIdx;
                if (Animation.allMarkAni.get(m).startTime < minStartTime) {
                    minStartTime = Animation.allMarkAni.get(m);
                }
            }
        })
        let allCurrentMarks: string[] = [];
        Animation.animations.forEach((ani: any, tmpAniId: string) => {
            if (tmpAniId === aniId) {
                allCurrentMarks = [...allCurrentMarks, ...ani.marksInOrder.slice(0, targetIdx + 1)];
            } else {
                for (let i = 0, len = ani.marksInOrder.length; i < len; i++) {
                    if (Animation.allMarkAni.get(ani.marksInOrder[i]).startTime >= minStartTime) {
                        break;
                    }
                    allCurrentMarks.push(ani.marksInOrder[i]);
                }
            }
        })
        allCurrentMarks = [...state.staticMarks, ...allCurrentMarks];
        // const allCurrentMarks = Animation.animations.get(aniId).marksInOrder.slice(0, targetIdx + 1);

        let drawDuration: boolean = aniLeaf.timingRef === TimingSpec.timingRef.previousEnd;
        if (typeof aniLeaf.alignTo !== 'undefined') {
            drawDuration = KfItem.allKfInfo.get(aniLeaf.alignTo).durationIcon;
        }

        let tmpKf: IKeyframe = {
            id: aniLeaf.id,
            // parentObj: parentObj,
            delay: aniLeaf.delay,
            delayIcon: aniLeaf.delay > 0 && leafIdx > 0,
            duration: tmpDuration,
            durationIcon: drawDuration,
            allCurrentMarks: allCurrentMarks,
            allGroupMarks: parentMarks,
            marksThisKf: aniLeaf.marks
        }
        if (typeof aniLeaf.alignWith !== 'undefined') {
            tmpKf.alignWith = aniLeaf.alignWith;
        }
        if (typeof aniLeaf.alignWithIds !== 'undefined') {
            tmpKf.alignWithKfs = aniLeaf.alignWithIds;
        }
        if (typeof aniLeaf.alignTo !== 'undefined') {
            tmpKf.alignTo = aniLeaf.alignTo;
        }
        KfItem.allKfInfo.set(tmpKf.id, tmpKf);
        return tmpKf;
    }
}