import { CanisSpec } from 'canis_toolkit'

type dataDatumType = {
    [key: string]: string | number
}

export default class Util {
    static attrType: dataDatumType = {};
    static NUMERIC_ATTR: string = 'numeric';
    static CATEGORICAL_ATTR: string = 'categorical';
    static NUMERIC_CATEGORICAL_ATTR: string[] = ['Year', 'year', 'Month', 'month', 'Day', 'day'];
    static EFFECTIVENESS_RANKING: string[] = ['position', 'color', 'shape'];

    public static suggestSelection(markIds: string[], markData: Map<string, any>) {
        //find the same and diff attributes of the selected marks
        const [sameAttrs, diffAttrs] = this.compareAttrs(markIds, markData);
        //filter attributes according to the effectiveness ranking
        const filteredDiffAttrs = this.filterAttrs(diffAttrs);

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
                let tmpAttrType = CanisSpec.chartUnderstanding[attrs[j]];
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
    public static compareAttrs(markIds: string[], markData: Map<string, any>): string[][] {
        let sameAttr: string[] = [], diffAttrs: string[] = [];
        for (let attrName in this.attrType) {
            let sameAttrType = true;
            const firstMarkType = markData.get(markIds[0])[attrName];
            for (let i = 1, len = markIds.length; i < len; i++) {
                if (markData.get(markIds[i])[attrName] !== firstMarkType) {
                    sameAttrType = false;
                    break;
                }
            }
            if (sameAttrType && this.attrType[attrName] === this.CATEGORICAL_ATTR) {
                sameAttr.push(attrName);
            } else if (!sameAttrType && this.attrType[attrName] === this.CATEGORICAL_ATTR) {
                diffAttrs.push(attrName);
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