import { IState } from '../state'
import Canis, { TimingSpec } from 'canis_toolkit';
import { ActionSpec, Animation } from 'canis_toolkit';

export let canis = new Canis();

export interface IChartSpec {
    id?: string
    type?: string
    source: string
}

export interface ISort {
    field?: string
    order: string | string[]
}

export interface IGrouping {
    reference?: string
    delay?: number
    groupBy: string
    sort?: ISort
    grouping?: IGrouping
}

export interface IOffset {
    field: string
    minOffset: number
}

export interface IDuration {
    field: string
    minDuration: number
}

export interface IAction {
    reference?: string
    offset?: number | IOffset
    type: string
    easing?: string
    duration?: number | IDuration
}

export interface IAlign {
    target: string
    type: string
    merge: boolean
}

export interface IAnimationSpec {
    id?: string
    reference?: string
    align?: IAlign
    offset?: number | IOffset
    selector: string
    grouping?: IGrouping
    effects: IAction[]
    chartIdx?: string
}

export interface ICanisSpec {
    charts: IChartSpec[]
    animations: IAnimationSpec[]
}

export default class CanisGenerator {
    public static generateChartSpec(charts: string[]): IChartSpec[] {
        let chartSpecs: IChartSpec[] = [];
        for (let i = 0; i < charts.length; i++) {
            const chartSpec: IChartSpec = {
                source: charts[i]
            }
            chartSpecs.push(chartSpec);
            // this.canisSpec.charts.push(chartSpec);
        }
        return chartSpecs;
    }

    public generateAnimationSpec(): void {

    }

    public static validate(spec: ICanisSpec): boolean {
        if (spec.charts.length === 0) {
            console.warn('there are no input charts!');
            return false;
        }
        if (spec.animations.length > 0) {
            //remove empty animations
            let i = spec.animations.length;
            while (i--) {
                const tmpAni: IAnimationSpec = spec.animations[i];
                if (tmpAni.selector === '' || tmpAni.selector === '#') {
                    spec.animations.splice(i, 1);
                }
            }
        }
        if (spec.animations.length === 0) {
            const animationSpec: IAnimationSpec = {
                selector: '.mark',
                effects: [{ type: ActionSpec.actionTypes.fade, duration: 300 }]
            }
            spec.animations.push(animationSpec);
        }
        return true;
    }

    public static resetSpec(spec: ICanisSpec): void {
        spec.animations = [];
    }

    public static updateKfDelay(groupingSpec: IGrouping, delay: number): void {
        if (typeof groupingSpec.grouping !== 'undefined') {
            this.updateKfDelay(groupingSpec.grouping, delay);
        } else {
            groupingSpec.delay = delay;
        }
    }

    public static removeKfDelay(groupingSpec: IGrouping): void {
        if (typeof groupingSpec.grouping !== 'undefined') {
            this.removeKfDelay(groupingSpec.grouping);
        } else {
            delete groupingSpec.delay;
        }
    }

    public static updateKfRef(groupingSpec: IGrouping, ref: string): void {
        if (typeof groupingSpec.grouping !== 'undefined') {
            this.updateKfRef(groupingSpec.grouping, ref);
        } else {
            groupingSpec.reference = ref;
        }
    }

    public static updateKfRefAndDelay(groupingSpec: IGrouping, ref: string, delay: number): void {
        if (typeof groupingSpec.grouping !== 'undefined') {
            this.updateKfRefAndDelay(groupingSpec.grouping, ref, delay);
        } else {
            groupingSpec.reference = ref;
            groupingSpec.delay = delay;
        }
    }

    public static removeLowestGrouping(groupingSpec: IGrouping): void {
        if (typeof groupingSpec.grouping !== 'undefined') {
            if (typeof groupingSpec.grouping.grouping !== 'undefined') {
                this.removeLowestGrouping(groupingSpec.grouping);
            } else {
                delete groupingSpec.grouping;
            }
        }
    }

    public static updateGroupTiming(groupingSpec: IGrouping, groupRef: string, ref: string): void {
        if (groupingSpec.groupBy === groupRef) {
            groupingSpec.reference = ref;
        } else {
            if (typeof groupingSpec.grouping !== 'undefined') {
                this.updateGroupTiming(groupingSpec.grouping, groupRef, ref);
            }
        }
    }

    public static updateGroupDelay(groupingSpec: IGrouping, groupRef: string, delay: number): void {
        if (groupingSpec.groupBy === groupRef) {
            groupingSpec.delay = delay;
        } else {
            if (typeof groupingSpec.grouping !== 'undefined') {
                this.updateGroupDelay(groupingSpec.grouping, groupRef, delay);
            }
        }
    }

    public static updateGroupDelayTiming(groupingSpec: IGrouping, groupRef: string, delay: number, ref: string): void {
        if (groupingSpec.groupBy === groupRef) {
            groupingSpec.delay = delay;
            groupingSpec.reference = ref;
        } else {
            if (typeof groupingSpec.grouping !== 'undefined') {
                this.updateGroupDelayTiming(groupingSpec.grouping, groupRef, delay, ref);
            }
        }
    }

    public static removeGroupDelay(groupingSpec: IGrouping, groupRef: string): void {
        if (groupingSpec.groupBy === groupRef) {
            delete groupingSpec.delay;
        } else {
            if (typeof groupingSpec.grouping !== 'undefined') {
                this.removeGroupDelay(groupingSpec.grouping, groupRef);
            }
        }
    }

    public static removeGroupDelayUpdateTiming(groupingSpec: IGrouping, groupRef: string, ref: string): void {
        if (groupingSpec.groupBy === groupRef) {
            delete groupingSpec.delay;
            groupingSpec.reference = ref;
        } else {
            if (typeof groupingSpec.grouping !== 'undefined') {
                this.removeGroupDelayUpdateTiming(groupingSpec.grouping, groupRef, ref);
            }
        }
    }

    public static mergeGroup(groupingSpec: IGrouping, groupRef: string, parentGrouping?: IGrouping): IGrouping {
        if (groupingSpec.groupBy === groupRef) {
            if (typeof groupingSpec.grouping !== 'undefined') {
                return groupingSpec.grouping;
            } else {
                // delete parentGrouping.grouping;
                return undefined;
            }
        } else {
            if (typeof groupingSpec.grouping !== 'undefined') {
                groupingSpec.grouping = this.mergeGroup(groupingSpec.grouping, groupRef, groupingSpec);
                return groupingSpec;
            }
        }
    }

    public static updateDuration(actionSpec: IAction, duration: number): void {
        //TODO: consider data binding
        actionSpec.duration = duration;
    }

    public static updateAniOffset(ani: IAnimationSpec, offset: number): void {
        ani.offset = offset;
    }

    public static updateStaticSelector(ani: IAnimationSpec, staticMarks: string[]): void {
        let currentSelectedMarks: string[] = [];
        if (ani.selector === '.mark') {
            Animation.markClass.forEach((clsName: string, mId: string) => {
                if (!staticMarks.includes(mId)) {
                    currentSelectedMarks.push(`#${mId}`);
                }
            })
        } else {
            ani.selector.split(', ').forEach((s: string) => {
                const mId: string = s.substring(1);
                if (!staticMarks.includes(mId)) {
                    currentSelectedMarks.push(`#${mId}`);
                }
            });
        }
        ani.selector = currentSelectedMarks.join(', ');
    }

    public static updateGrouping(parent: IAnimationSpec | IGrouping, attrComb: string[], attrValueSort?: string[][]) {
        if (typeof parent.grouping !== 'undefined') {
            parent.grouping.groupBy = attrComb[0];
        } else {
            parent.grouping = { groupBy: attrComb[0] };
        }
        if (typeof attrValueSort !== 'undefined') {
            parent.grouping.sort = {
                order: attrValueSort[0]
            }
            attrValueSort.splice(0, 1);
        }
        attrComb.splice(0, 1);
        if (attrComb.length > 0) {
            this.updateGrouping(parent.grouping, attrComb, attrValueSort);
        }
    }

    public static createGrouping(parent: IAnimationSpec | IGrouping, attrComb: string[], attrValueSort?: string[][]) {
        parent.grouping = { groupBy: attrComb[0], reference: TimingSpec.timingRef.previousEnd };
        if (typeof attrValueSort !== 'undefined') {
            parent.grouping.sort = {
                order: attrValueSort[0]
            }
            attrValueSort.splice(0, 1);
        }
        attrComb.splice(0, 1);
        if (attrComb.length > 0) {
            this.createGrouping(parent.grouping, attrComb, attrValueSort);
        }
    }

    public static appendGrouping(parent: IAnimationSpec | IGrouping, attrComb: string[], attrValueSort?: string[][]) {
        if (typeof parent.grouping !== 'undefined') {
            this.appendGrouping(parent.grouping, attrComb, attrValueSort);
        } else {
            this.createGrouping(parent, attrComb, attrValueSort);
        }
    }

    public static removeMarksFromSelector(ani: IAnimationSpec, targetMarks: string[]) {
        let currentMarks: string[] = ani.selector.split(', ');
        let filteredMarks: string[] = [];
        currentMarks.forEach((mSelector: string) => {
            if (!targetMarks.includes(mSelector)) {
                filteredMarks.push(mSelector);
            }
        })
        ani.selector = filteredMarks.join(', ');
    }

    public static updateMerge(ani: IAnimationSpec, merge: boolean) {
        ani.align.merge = merge;
    }
}