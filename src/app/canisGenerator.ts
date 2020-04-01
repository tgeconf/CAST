import { IState } from './state'
import Canis from 'canis_toolkit';
import { ActionSpec } from 'canis_toolkit';

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

export interface IAnimationSpec {
    reference?: string
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
    // public canisSpec: ICanisSpec;

    // constructor() {
    //     this.canisSpec = {
    //         charts: [],
    //         animations: []
    //     }
    // }

    // public generate(state: IState): void {
    //     console.log('generating spec: ', state);
    //     this.resetSpec();
    //     this.generateChartSpec(state.charts);//generate chart spec 
    //     this.generateAnimationSpec();
    //     this.validate();
    //     console.log(this.canisSpec);
    // }

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

    public static validate(spec: ICanisSpec): void {
        if (spec.charts.length === 0) {
            console.warn('there are no input charts!');
        }
        if (spec.animations.length === 0) {
            const animationSpec: IAnimationSpec = {
                selector: '.mark',
                effects: [{ type: ActionSpec.actionTypes.fade, duration: 300 }]
            }
            spec.animations.push(animationSpec);
        }
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
        console.log('input grouping : ', groupingSpec);
        if (groupingSpec.groupBy === groupRef) {
            if (typeof groupingSpec.grouping !== 'undefined') {
                // if (typeof parentGrouping !== 'undefined') {
                //     parentGrouping.grouping = groupingSpec.grouping;
                // } else {
                return groupingSpec.grouping;
                // }
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

    public static updateAniOffset(ani: IAnimationSpec, offset: number) {
        ani.offset = offset;
    }

    // public static removeGrouping()
    // public resetSpec(): void {
    //     this.canisSpec = {
    //         charts: [],
    //         animations: []
    //     }
    // }

    // public static replaceAnimationSpec(){

    // }
}

// export let canisGenerator = new CanisGenerator();