import { ChartSpec } from 'canis_toolkit'
import Tool from '../util/tool'

type dataDatumType = {
    [key: string]: string | number
}

export default class Util {
    static attrType: dataDatumType = {};
    static NUMERIC_ATTR: string = 'numeric';
    static CATEGORICAL_ATTR: string = 'categorical';
    static NUMERIC_CATEGORICAL_ATTR: string[] = ['Year', 'year', 'Month', 'month', 'Day', 'day'];
    static EFFECTIVENESS_RANKING: string[] = ['position', 'color', 'shape'];
    static EXCLUDED_DATA_ATTR: string[] = ['_TYPE', 'text'];

    /**
     * 
     * @param markIds : selected marks
     */
    public static suggestSelection(markIds: string[]): string[] {
        //TODO: judge if this is data-driven suggestion or non-data-driven
        /****** non-data-driven suggestion ******/


        /****** data-driven suggestion ******/
        //find the same and diff attributes of the selected marks
        const [sameAttrs, diffAttrs] = this.compareAttrs(markIds);
        //filter attributes according to the effectiveness ranking
        const filteredDiffAttrs = this.filterAttrs(diffAttrs);
        //list all data-encoded marks
        let allMarkIds: string[] = [];
        ChartSpec.dataMarkDatum.forEach((datum, markId) => {
            allMarkIds.push(markId);
        })
        const [sections, orderedSectionIds] = this.partitionChart(sameAttrs, filteredDiffAttrs, allMarkIds);

        //judge if marks from one section are selected all, otherwise repeat selection with the one with the most selected marks
        let allSelected: boolean = false, mostSelectionNumInSec: number = 0;
        sections.forEach((marksInSec, secId) => {
            allSelected = Tool.arrayContained(markIds, marksInSec) || allSelected;//whether marks in this section are all selected
            // console.log(secId, marksInSec, allSelected);
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
                sectionId += ChartSpec.dataMarkDatum.get(markId)[attr] + ',';
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
            valueOfSameAttrs.push(ChartSpec.dataMarkDatum.get(markIds[0])[sAttr]);
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
                                if (ChartSpec.dataMarkDatum.get(mId)[sameAttrs[j]] !== ChartSpec.dataMarkDatum.get(markIds[0])[sameAttrs[j]]) {
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
                        if (ChartSpec.dataMarkDatum.get(mId)[sameAttrs[j]] !== ChartSpec.dataMarkDatum.get(markIds[0])[sameAttrs[j]]) {
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
                sectionId += ChartSpec.dataMarkDatum.get(markId)[attr] + ',';
                seperateSecId.push(ChartSpec.dataMarkDatum.get(markId)[attr]);
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
            const firstMarkType = ChartSpec.dataMarkDatum.get(markIds[0])[attrName];
            for (let i = 1, len = markIds.length; i < len; i++) {
                if (ChartSpec.dataMarkDatum.get(markIds[i])[attrName] !== firstMarkType) {
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
    public static determinAttrType(markData: Map<string, any>) {
        markData.forEach((dataDatum: any, markId: string) => {
            for (const key in dataDatum) {
                let tmpAttrType: string = (!isNaN(Number(dataDatum[key])) && dataDatum[key] !== '') ? this.NUMERIC_ATTR : this.CATEGORICAL_ATTR;
                this.attrType[key] = tmpAttrType;
            }
        })
    }
}