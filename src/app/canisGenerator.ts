import { IState } from './state'
import Canis from 'canis_toolkit';
import { ActionSpec } from 'canis_toolkit';

export let canis = new Canis();

interface IChartSpec {
    id?: string
    type?: string
    source: string
}

interface ISort {
    field?: string
    order: string | string[]
}

interface IGrouping {
    reference?: string
    delay?: number
    groupBy: string
    sort?: ISort
    grouping?: IGrouping
}

interface IOffset {
    field: string
    minOffset: number
}

interface IDuration {
    field: string
    minDuration: number
}

interface IAction {
    reference?: string
    offset?: number | IOffset
    type: string
    easing?: string
    duration?: number | IDuration
}

interface IAnimationSpec {
    reference?: string
    offset?: number | IOffset
    selector: string
    grouping?: IGrouping
    actions: IAction[]
}

export interface ICanisSpec {
    charts: IChartSpec[]
    animations: IAnimationSpec[]
}

class CanisGenerator {
    public canisSpec: ICanisSpec;

    constructor() {
        this.canisSpec = {
            charts: [],
            animations: []
        }
    }

    public generate(state: IState): void {
        console.log('generating spec: ', state);
        this.generateChartSpec(state.charts);//generate chart spec 
        this.generateAnimationSpec();
        this.validate();
        console.log(this.canisSpec);
    }

    public generateChartSpec(charts: string[]): void {
        for (let i = 0; i < charts.length; i++) {
            const chartSpec: IChartSpec = {
                source: charts[i]
            }
            this.canisSpec.charts.push(chartSpec);
        }
    }

    public generateAnimationSpec(): void {

    }

    public validate(): void {
        if (this.canisSpec.charts.length === 0) {
            console.error('there are no input charts!');
        }
        if (this.canisSpec.animations.length === 0) {
            const animationSpec: IAnimationSpec = {
                selector: '.mark',
                actions: [{ type: ActionSpec.actionTypes.appear }]
            }
            this.canisSpec.animations.push(animationSpec);
        }
    }
}

export let canisGenerator = new CanisGenerator();