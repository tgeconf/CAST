import { Animation, ChartSpec } from 'canis_toolkit';
import Tool from '../../util/tool';
import Util from './util';
import { IDataItem, IPath } from './ds';

export default class Suggest {
    static NUMERIC_CAT_ATTRS: string[] = ['Year', 'year', 'Month', 'month', 'Day', 'day'];
    static allPaths: IPath[] = [];

    /**
     * separate input marks to data encoded and non data encoded 
     * @param markIdArr 
     */
    public static separateDataAndNonDataMarks(markIdArr: string[]): { dataMarks: string[], nonDataMarks: string[] } {
        let dataMarks: string[] = [];
        let nonDataMarks: string[] = [];
        markIdArr.forEach((mId: string) => {
            if (typeof ChartSpec.dataMarkDatum.get(mId) !== 'undefined') {
                dataMarks.push(mId);
            } else {
                nonDataMarks.push(mId);
            }
        })
        return { dataMarks: dataMarks, nonDataMarks: nonDataMarks }
    }

    /**
     * find attributes with different values in the given mark arrays
     * @param markIdArr1 
     * @param markIdArr2 
     * @param dataEncode 
     */
    public static findAttrWithDiffValue(markIdArr1: string[], markIdArr2: string[], dataEncode: boolean): string[] {
        let attrDiffValues: string[] = [];
        const dataAttrArr: string[] = dataEncode ? Util.dataAttrs : Util.nonDataAttrs;
        const dataTable: Map<string, IDataItem> = dataEncode ? Util.filteredDataTable : Util.nonDataTable;
        dataAttrArr.forEach((aName: string) => {
            if (Util.attrType[aName] === Util.CATEGORICAL_ATTR) {
                let valueRecord1: Set<string> = new Set(), valueRecord2: Set<string> = new Set();
                markIdArr1.forEach((mId: string) => {
                    valueRecord1.add(`${dataTable.get(mId)[aName]}`);
                })
                markIdArr2.forEach((mId: string) => {
                    valueRecord2.add(`${dataTable.get(mId)[aName]}`);
                })
                if (!Tool.identicalArrays([...valueRecord1], [...valueRecord2])) {
                    attrDiffValues.push(aName);
                }
            }
        })

        return attrDiffValues;
    }

    public static removeEmptyCell(firstKfMarks: string[], attrToSec: string[], sameAttrs: string[], diffAttrs: string[], dataEncode: boolean): string[] {
        const tmpMarkRecord: string[] = [];
        const dataTable: Map<string, IDataItem> = dataEncode ? Util.filteredDataTable : Util.nonDataTable;
        dataTable.forEach((d: IDataItem, mId: string) => {
            let flag: boolean = true;
            sameAttrs.forEach((aName: string) => {
                if (d[aName] !== dataTable.get(firstKfMarks[0])[aName]) {
                    flag = false;
                }
            })
            if (flag) {
                tmpMarkRecord.push(mId);
            }
        })
        if (Tool.identicalArrays(firstKfMarks, tmpMarkRecord)) {//remove same attrs from attrToSecs
            diffAttrs.forEach((aName: string) => {
                if (attrToSec.includes(aName)) {
                    attrToSec.splice(attrToSec.indexOf(aName), 1);
                }
            })
        }
        return attrToSec;
    }

    /**
     * find the same and different attributes of the given marks
     * @param markIdArr 
     * @param dataEncode 
     */
    public static findSameDiffAttrs(markIdArr: string[], dataEncode: boolean): [string[], string[]] {
        let sameAttrs: string[] = [], diffAttrs: string[] = [];
        const dataAttrArr: string[] = dataEncode ? Util.dataAttrs : Util.nonDataAttrs;
        const dataTable: Map<string, IDataItem> = dataEncode ? Util.filteredDataTable : Util.nonDataTable;
        dataAttrArr.forEach((aName: string) => {
            if (Util.attrType[aName] === Util.CATEGORICAL_ATTR) {
                let flag: boolean = true;
                let firstValue: string | number = dataTable.get(markIdArr[0])[aName];
                for (let i = 1, len = markIdArr.length; i < len; i++) {
                    if (dataTable.get(markIdArr[i])[aName] !== firstValue) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    sameAttrs.push(aName);
                } else {
                    diffAttrs.push(aName);
                }
            }
        })
        return [sameAttrs, diffAttrs];
    }

    /**
     * filter the attribute names according to the effectiveness ranking of visual channels
     * @param attrArr 
     */
    public static filterAttrs(attrArr: string[]): string[] {
        let filteredAttrs: string[] = [];
        let typeRecorder: string = '';
        Util.EFFECTIVENESS_RANKING.forEach((channel: string) => {
            attrArr.forEach((aName: string) => {
                const tmpAttrChannel: string = ChartSpec.chartUnderstanding[aName];
                if (tmpAttrChannel === channel && (tmpAttrChannel === typeRecorder || typeRecorder === '')) {
                    filteredAttrs.push(aName);
                    typeRecorder = tmpAttrChannel;
                }
            })
        })
        return filteredAttrs;
    }

    /**
     * order the attribute names according to the effectiveness ranking of visual channels 
     * @param attrArr 
     */
    public static sortAttrs(attrArr: string[]): Map<string, string[]> {
        let orderedAttrs: Map<string, string[]> = new Map();
        Util.EFFECTIVENESS_RANKING.forEach((channel: string) => {
            attrArr.forEach((aName: string) => {
                let tmpAttrChannel: string = ChartSpec.chartUnderstanding[aName];
                if (tmpAttrChannel === channel) {
                    if (typeof orderedAttrs.get(channel) === 'undefined') {
                        orderedAttrs.set(channel, []);
                    }
                    orderedAttrs.get(channel).push(aName);
                }
            })
        })

        console.log('after ordering attrs: ', orderedAttrs);
        return orderedAttrs;
    }

    public static assignChannelName(attrArr: string[]): Map<string, string[]> {
        let channelAttrs: Map<string, string[]> = new Map();
        attrArr.forEach((aName: string) => {
            const tmpAttrChannel: string = ChartSpec.chartUnderstanding[aName];
            if (typeof channelAttrs.get(tmpAttrChannel) === 'undefined') {
                channelAttrs.set(tmpAttrChannel, []);
            }
            channelAttrs.get(tmpAttrChannel).push(aName);
        })
        return channelAttrs;
    }

    /**
     * 
     * @param {Map} sortedAttrs : key: visual channel, value : Array<String> attr names
     */
    public static generateAttrCombs(sortedAttrs: Map<string, string[]>) {
        let visualChannelNum: number = sortedAttrs.size;
        let allCombinations: string[][] = [];
        while (visualChannelNum > 0) {
            let count: number = 0;
            let candidateAttrs: string[] = [];
            let multiPosiAttrs: boolean = false, positionAttrs: string[] = [];
            for (let [channelName, attrs] of sortedAttrs) {
                candidateAttrs = [...candidateAttrs, ...attrs];
                count++;
                if (count === 1 && visualChannelNum !== 1 && channelName === 'position' && attrs.length > 1) {
                    multiPosiAttrs = true;
                    positionAttrs = attrs;
                } else if (count === visualChannelNum) {
                    let tmpCombRecord = Util.perm(candidateAttrs);
                    if (multiPosiAttrs) {//check for attr continuity
                        tmpCombRecord = Util.checkConti(tmpCombRecord, positionAttrs);
                    }
                    allCombinations = [...allCombinations, ...tmpCombRecord];
                    break;
                }
            }

            visualChannelNum--;
        }
        return allCombinations;
    }

    /**
     * 
     * @param sortedAttrs
     * @param valueIdx 
     * @param firstKfMarks 
     * @param lastKfMarks 
     * @param hasOneMrak 
     */
    public static generateRepeatKfs(
        sortedAttrs: Map<string, string[]>,
        valueIdx: Map<string, number>,
        firstKfMarks: string[],
        lastKfMarks: string[],
        hasOneMrak: boolean = false): Array<[string[], Map<string, string[]>, string[]]> {

        let possibleKfs: Array<[string[], Map<string, string[]>, string[]]> = [];

        //get all possible combinations of attrs
        const allCombinations: string[][] = this.generateAttrCombs(sortedAttrs);
        console.log('all combinations of attrs: ', allCombinations);

        //get values of the attrs in 1st kf
        let valuesFirstKf: Array<string | number> = [];
        sortedAttrs.forEach((attrArr: string[], channel: string) => {
            attrArr.forEach((aName: string) => {
                valuesFirstKf.push(Util.filteredDataTable.get(firstKfMarks[0])[aName]);
            })
        })
        valuesFirstKf = [...new Set(valuesFirstKf)];

        allCombinations.forEach((attrComb: string[]) => {
            let sections: Map<string, string[]> = new Map();//key: section id, value: mark array
            let sectionIdRecord: string[][] = [];
            let timeSecIdx: number[] = [];
            let tmpValueIdx: Map<number, number> = new Map();
            attrComb.forEach((aName: string, idx: number) => {
                tmpValueIdx.set(idx, valueIdx.get(aName));
                if (Util.timeAttrs.includes(aName)) {
                    timeSecIdx.push(idx);
                }
            })

            lastKfMarks.forEach((mId: string) => {
                let sectionId: string = '';
                let seperateSecId: string[] = []; //for ordering section ids
                attrComb.forEach((aName: string) => {
                    let tmpValue: string | number = Util.filteredDataTable.get(mId)[aName];
                    sectionId = `${sectionId}${tmpValue},`;
                    if (valuesFirstKf.includes(tmpValue)) {
                        let orderDirect: number = valueIdx.get(aName);
                        if (orderDirect === 1) {
                            tmpValue = 'zzz_' + tmpValue;//for ordering 
                        } else {
                            tmpValue = '000_' + tmpValue;//for ordering 
                        }
                    }
                    seperateSecId.push(`${tmpValue}`);
                })

                if (typeof sections.get(sectionId) === 'undefined') {
                    sections.set(sectionId, []);
                    sectionIdRecord.push(seperateSecId);
                }
                sections.get(sectionId).push(mId);
            })

            if (hasOneMrak) {
                let flag: boolean = false;//whether this one mark in the 1st kf is a section
                for (let [sectionId, markIdArr] of sections) {
                    if (markIdArr.includes(firstKfMarks[0]) && markIdArr.length === 1) {
                        flag = true;
                        break;
                    }
                }
                if (!flag) {//if this one mark cannot form a section, we need to add markid into section id
                    sections.clear();
                    sectionIdRecord = [];
                    lastKfMarks.forEach((mId: string) => {
                        let sectionId: string = '';
                        let seperateSecId: string[] = [];
                        attrComb.forEach((aName: string) => {
                            let tmpValue: string | number = Util.filteredDataTable.get(mId)[aName];
                            sectionId = `${sectionId}${tmpValue},`;
                            if (valuesFirstKf.includes(tmpValue)) {
                                let orderDirect: number = valueIdx.get(aName);
                                if (orderDirect === 1) {
                                    tmpValue = 'zzz_' + tmpValue;//for ordering 
                                } else {
                                    tmpValue = '000_' + tmpValue;//for ordering 
                                }
                            }
                            seperateSecId.push(`${tmpValue}`);
                        })
                        if (hasOneMrak) {
                            sectionId = `${sectionId}${mId},`;
                            seperateSecId.push(mId);
                        }
                        if (typeof sections.get(sectionId) === 'undefined') {
                            sections.set(sectionId, []);
                            sectionIdRecord.push(seperateSecId);
                        }
                        sections.get(sectionId).push(mId);
                    })
                }
            }

            //sort sectionIds
            sectionIdRecord.sort(function (a, b) {
                let diffValueIdx: number = 0;
                for (let i = 0, len = attrComb.length; i < len; i++) {
                    if (a[i] !== b[i]) {
                        diffValueIdx = i;
                        break;
                    }
                }

                let aComp: string | number = a[diffValueIdx], bComp: string | number = b[diffValueIdx];
                if (timeSecIdx.includes(diffValueIdx)) {
                    aComp = Util.fetchTimeNum(aComp);
                    bComp = Util.fetchTimeNum(bComp);
                }

                if (bComp > aComp) {
                    switch (tmpValueIdx.get(diffValueIdx)) {
                        case 0:
                        case 2:
                            return -1;
                        case 1:
                            return 1;
                    }
                } else {
                    switch (tmpValueIdx.get(diffValueIdx)) {
                        case 0:
                        case 2:
                            return 1;
                        case 1:
                            return -1;
                    }
                }
            })

            //remove 000_ and zzz_ added for ordering
            for (let i = 0, len = sectionIdRecord.length; i < len; i++) {
                for (let j = 0, len2 = sectionIdRecord[i].length; j < len2; j++) {
                    if (sectionIdRecord[i][j].includes('000_') || sectionIdRecord[i][j].includes('zzz_')) {
                        sectionIdRecord[i][j] = sectionIdRecord[i][j].substring(4);
                    }
                }
            }
            let orderedSectionIds: string[] = sectionIdRecord.map(a => a.join(',') + ',');
            possibleKfs.push([attrComb, sections, orderedSectionIds]);
        })

        console.log('possible kfs: ', possibleKfs);
        return possibleKfs;
    }

    /**
     * find the next unique kf after kfStartIdx
     * @param allPath 
     * @param kfStartIdx 
     */
    public static findNextUniqueKf(allPaths: IPath[], kfStartIdx: number): number {
        let len: number = 0;
        allPaths.forEach((p: IPath) => {
            if (p.kfMarks.length > len) {
                len = p.kfMarks.length;
            }
        })
        for (let i = kfStartIdx + 1; i < len; i++) {
            for (let j = 1, len2 = allPaths.length; j < len2; j++) {
                if (!Tool.identicalArrays(allPaths[j].kfMarks[i], allPaths[0].kfMarks[i])) {
                    return i;
                }
            }
        }
        return -1;
    }

    // /**
    //  * return index of the unique kfs in each path
    //  * @param {*} repeatKfRecord 
    //  */
    // public static findUniqueKfs(repeatKfRecord: string[][][]): number[][] {
    //     let pathWithUniqueAndMissingKfs: number[][] = [];
    //     for (let i = 0, len = repeatKfRecord.length; i < len; i++) {
    //         let uniqueKf: number[] = []; //record unique kf idx of this path
    //         let removeIdx = [i];//index of the paths that don't need to compare
    //         //kf index currently being compared
    //         for (let compareKfIdx = 0, len2 = repeatKfRecord[i].length; compareKfIdx < len2; compareKfIdx++) {
    //             let flag = true;//if the kf is the same in all paths
    //             for (let j = 0; j < len; j++) {
    //                 if (!removeIdx.includes(j)) {
    //                     //compare the current kf
    //                     let tmpFlag = Tool.identicalArrays(repeatKfRecord[i][compareKfIdx], repeatKfRecord[j][compareKfIdx]);
    //                     if (!tmpFlag) {//this path in this kf is different from others
    //                         flag = false;
    //                         removeIdx.push(j);
    //                     } else {
    //                         continue;
    //                     }
    //                 }
    //             }
    //             if (!flag) {
    //                 uniqueKf.push(compareKfIdx);
    //             }
    //         }
    //         pathWithUniqueAndMissingKfs.push(uniqueKf);
    //     }
    //     return pathWithUniqueAndMissingKfs;
    // }

    public static suggestPaths(firstKfMarks: string[], lastKfMarks: string[]) {
        this.allPaths = [];
        console.log('1st kf marks: ', firstKfMarks, 'last kf marks: ', lastKfMarks);
        const sepFirstKfMarks: { dataMarks: string[], nonDataMarks: string[] } = this.separateDataAndNonDataMarks(firstKfMarks);
        const sepLastKfMarks: { dataMarks: string[], nonDataMarks: string[] } = this.separateDataAndNonDataMarks(lastKfMarks);
        if (sepFirstKfMarks.dataMarks.length > 0 && sepFirstKfMarks.nonDataMarks.length > 0) {//there are both data encoded and non data encoded marks in the first kf
            //no suggestion

        } else if (sepFirstKfMarks.dataMarks.length > 0 && sepFirstKfMarks.nonDataMarks.length === 0) {
            //suggest based on data attrs
            const firstKfDataMarks: string[] = sepFirstKfMarks.dataMarks;
            const lastKfDataMarks: string[] = sepLastKfMarks.dataMarks;
            if (Tool.identicalArrays(firstKfDataMarks, lastKfDataMarks)) {
                //refresh current spec

            } else {
                let attrWithDiffValues: string[] = this.findAttrWithDiffValue(firstKfDataMarks, lastKfDataMarks, true);
                console.log('found attrs with diff values: ', attrWithDiffValues);
                const [sameAttrs, diffAttrs] = this.findSameDiffAttrs(firstKfDataMarks, true);
                console.log('found same and diff attrs', sameAttrs, diffAttrs);
                let flag: boolean = false;
                if (attrWithDiffValues.length === 0) {
                    flag = true;
                    const filteredDiffAttrs: string[] = this.filterAttrs(diffAttrs);
                    attrWithDiffValues = [...sameAttrs, ...filteredDiffAttrs];
                }
                //remove empty cell problem
                attrWithDiffValues = this.removeEmptyCell(firstKfMarks, attrWithDiffValues, sameAttrs, diffAttrs, true);

                console.log('attrs to make secs: ', attrWithDiffValues);
                let valueIdx: Map<string, number> = new Map();//key: attr name, value: index of the value in all values
                attrWithDiffValues.forEach((aName: string) => {
                    const targetValue: string | number = Util.filteredDataTable.get(firstKfDataMarks[0])[aName];
                    const tmpIdx: number = Util.dataValues.get(aName).indexOf(targetValue);
                    if (tmpIdx === 0) {
                        valueIdx.set(aName, 0);//this value is the 1st in all values
                    } else if (tmpIdx === Util.dataValues.get(aName).length - 1) {
                        valueIdx.set(aName, 1);//this value is the last in all values
                    } else {
                        valueIdx.set(aName, 2);//this value is in the middle of all values
                    }
                    console.log('value index: ', aName, valueIdx.get(aName));
                })

                //sortedAttrs: key: channel, value: attr array
                const sortedAttrs: Map<string, string[]> = flag ? this.assignChannelName(attrWithDiffValues) : this.sortAttrs(attrWithDiffValues);
                console.log('ordered attrs: ', sortedAttrs);

                const oneMarkInFirstKf: boolean = firstKfDataMarks.length === 1;
                let allPossibleKfs = this.generateRepeatKfs(sortedAttrs, valueIdx, firstKfDataMarks, lastKfDataMarks, oneMarkInFirstKf);
                let repeatKfRecord: any[] = [];
                let filterAllPaths: number[] = [], count = 0;//record the index of the path that should be removed: not all selected & not one mark in 1st kf
                allPossibleKfs.forEach((possiblePath: any[]) => {
                    let attrComb: string[] = possiblePath[0];
                    let sections: Map<string, string[]> = possiblePath[1];
                    let orderedSectionIds: string[] = possiblePath[2];
                    console.log('current comb: ', attrComb, orderedSectionIds, sections);
                    let repeatKfs = [];
                    let allSelected = false;
                    let oneMarkFromEachSec = false, oneMarkEachSecRecorder: Set<string> = new Set();
                    let numberMostMarksInSec = 0, selectedMarks: Map<string, string[]> = new Map();//in case of one mark from each sec

                    orderedSectionIds.forEach((sectionId: string) => {
                        let tmpSecMarks = sections.get(sectionId);
                        if (tmpSecMarks.length > numberMostMarksInSec) {
                            numberMostMarksInSec = tmpSecMarks.length;
                        }

                        //check if marks in 1st kf are one from each sec
                        firstKfMarks.forEach((mId: string) => {
                            if (tmpSecMarks.includes(mId)) {
                                selectedMarks.set(sectionId, [mId]);
                                oneMarkEachSecRecorder.add(sectionId);
                            }
                        })
                    })

                    if (oneMarkEachSecRecorder.size === sections.size && firstKfMarks.length === sections.size) {
                        oneMarkFromEachSec = true;
                    }

                    if (oneMarkFromEachSec) {
                        for (let i = 0; i < numberMostMarksInSec - 1; i++) {
                            let tmpKfMarks = [];
                            for (let j = 0; j < orderedSectionIds.length; j++) {
                                let tmpSecMarks = sections.get(orderedSectionIds[j]);
                                let tmpSelected = selectedMarks.get(orderedSectionIds[j]);
                                for (let z = 0; z < tmpSecMarks.length; z++) {
                                    if (!tmpSelected.includes(tmpSecMarks[z])) {
                                        tmpKfMarks.push(tmpSecMarks[z]);
                                        selectedMarks.get(orderedSectionIds[j]).push(tmpSecMarks[z]);
                                        break;
                                    }
                                }
                            }
                            repeatKfs.push(tmpKfMarks);
                        }
                    } else {
                        for (let i = 0, len = orderedSectionIds.length; i < len; i++) {
                            let tmpSecMarks = sections.get(orderedSectionIds[i]);
                            let judgeSame = Tool.identicalArrays(firstKfMarks, tmpSecMarks);
                            if (!allSelected && judgeSame && !oneMarkInFirstKf) {
                                allSelected = true;
                            }
                            if (!judgeSame) {//dont show the 1st kf twice
                                repeatKfs.push(tmpSecMarks);
                            }
                        }
                    }

                    let samePath = false;
                    for (let i = 0; i < this.allPaths.length; i++) {
                        if (Tool.identicalArrays(repeatKfs, this.allPaths[i].kfMarks)) {
                            samePath = true;
                            break;
                        }
                    }
                    // repeatKfRecord.push(repeatKfs);
                    this.allPaths.push({ attrComb: attrComb, sortedAttrValueComb: orderedSectionIds, kfMarks: repeatKfs, firstKfMarks: firstKfDataMarks, lastKfMarks: lastKfDataMarks });

                    //check if the selection is one mark from each sec
                    if ((!allSelected && !oneMarkInFirstKf && !oneMarkFromEachSec) || samePath) {
                        filterAllPaths.push(count);
                    }
                    count++;
                })

                //filter all paths
                filterAllPaths.sort(function (a, b) {
                    return b - a;
                })
                for (let i = 0; i < filterAllPaths.length; i++) {
                    this.allPaths.splice(filterAllPaths[i], 1);
                }

                console.log('all paths: ', this.allPaths);
            }
        } else if (sepFirstKfMarks.dataMarks.length === 0 && sepFirstKfMarks.nonDataMarks.length > 0) {
            //suggest based on non data attrs
            const firstKfNonDataMarks: string[] = sepFirstKfMarks.nonDataMarks;
            const lastKfNonDataMarks: string[] = sepLastKfMarks.nonDataMarks;
            console.log('1st non data kf marks: ', firstKfNonDataMarks, lastKfNonDataMarks);

            if (!Tool.identicalArrays(firstKfNonDataMarks, lastKfNonDataMarks)) {
                console.log('non data table', Util.nonDataTable);
                //count the number of types in first kf
                const typeCount: Map<string, number> = new Map();
                firstKfNonDataMarks.forEach((mId: string) => {
                    let attrValStr: string = '';
                    const tmpDatum: IDataItem = Util.nonDataTable.get(mId);
                    Object.keys(tmpDatum).forEach((attr: string) => {
                        if (Util.isNonDataAttr(attr)) {
                            attrValStr += `*${tmpDatum[attr]}`;
                        }
                    })
                    if (typeof typeCount.get(attrValStr) === 'undefined') {
                        typeCount.set(attrValStr, 0);
                    }
                    typeCount.set(attrValStr, typeCount.get(attrValStr) + 1);
                })
                const attrValStr = [...typeCount][0][0];
                if (typeCount.size === 1 && [...typeCount][0][1] === 1) {
                    //fetch all marks with the same attr values
                    let suggestionLastKfMarks: string[] = [...firstKfNonDataMarks];
                    Util.nonDataTable.forEach((datum: IDataItem, mId: string) => {
                        let tmpAttrValStr: string = '';
                        Object.keys(datum).forEach((attr: string) => {
                            if (Util.isNonDataAttr(attr)) {
                                tmpAttrValStr += `*${datum[attr]}`;
                            }
                        })
                        if (tmpAttrValStr === attrValStr) {
                            suggestionLastKfMarks.push(mId);
                        }
                    })
                    let asscendingOrder: string[] = suggestionLastKfMarks.sort((a: string, b: string) => {
                        return b > a ? -1 : 1;
                    })
                    let descendingOrder: string[] = suggestionLastKfMarks.sort((a: string, b: string) => {
                        return b > a ? 1 : -1;
                    })
                    if (asscendingOrder.indexOf(firstKfNonDataMarks[0]) === 0) {
                        suggestionLastKfMarks = asscendingOrder;
                    } else if (descendingOrder.indexOf(firstKfNonDataMarks[0]) === 0) {
                        suggestionLastKfMarks = descendingOrder;
                    }
                    suggestionLastKfMarks = [...new Set(suggestionLastKfMarks)];

                    const tmpKfMarks: string[][] = [];
                    suggestionLastKfMarks.forEach((mId: string) => {
                        tmpKfMarks.push([mId]);
                    })
                    console.log('last kf: ', suggestionLastKfMarks);
                    this.allPaths = [{ attrComb: ['id'], sortedAttrValueComb: suggestionLastKfMarks, kfMarks: tmpKfMarks, firstKfMarks: firstKfNonDataMarks, lastKfMarks: suggestionLastKfMarks }];
                    console.log('suggestion based on non data mark: ', this.allPaths);
                }
            }
            //         attrComb: string[]
            // sortedAttrValueComb: string[]
            // kfMarks: string[][]
            // firstKfMarks: string[]
            // lastKfMarks: string[]
        }
    }
}