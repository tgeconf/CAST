import { canisGenerator, canis, ICanisSpec } from './canisGenerator'

export interface IChart {
    charts: string[],
    selection: string[],
    suggestion: boolean
}

export interface IKeyframe {

}

export interface IStore {
    chartStatus: IChart
    keyframeStatus: IKeyframe
}

export interface IState {
    chartStatus: IChart
    keyframeStatus: IKeyframe
    // setChartStatus(cs: IChart): void
    // getChartStatus(): IChart
    // setCharts(charts: string[]): void
    // getCharts(): string[]
    // setSelection(selection: string[]): void
    // getSelection(): string[]
    // setSuggestion(suggestion: boolean): void
    // getSuggestion(): boolean
}

export class State implements IState {
    _chartStatus: IChart
    keyframeStatus: IKeyframe

    constructor() {
        this._chartStatus = {
            charts: [],
            selection: [],
            suggestion: false
        }
    }

    set chartStatus(cs: IChart) {
        this._chartStatus = cs;
        this.trigerSpecGenerator();
    }
    get chartStatus(): IChart {
        return this._chartStatus;
    }
    // set charts(charts: string[]): void {
    //     this.chartStatus.charts = charts;
    //     this.trigerSpecGenerator();
    // }
    // getCharts(): string[] {
    //     return this.chartStatus.charts;
    // }
    // setSelection(selection: string[]): void {
    //     this.chartStatus.selection = selection;
    // }
    // getSelection(): string[] {
    //     return this.chartStatus.selection;
    // }
    // setSuggestion(suggestion: boolean): void {
    //     this.chartStatus.suggestion = suggestion;
    // }
    // getSuggestion(): boolean {
    //     return this.chartStatus.suggestion;
    // }

    private trigerSpecGenerator(): void {
        console.log('going to generate spec', this);
        canisGenerator.generate(this);
        this.renderSpec(canisGenerator.canisSpec);
    }

    private renderSpec(spec: ICanisSpec): void {
        canis.renderSpec(spec, () => { });
    }
}

export let state = new State();