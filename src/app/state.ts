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
    setChartStatus(cs: IChart): void
    getChartStatus(): IChart
    setCharts(charts: string[]): void
    getCharts(): string[]
    setSelection(selection: string[]): void
    getSelection(): string[]
    setSuggestion(suggestion: boolean): void
    getSuggestion(): boolean
}

export class State implements IState {
    chartStatus: IChart
    setChartStatus(cs: IChart): void {
        this.chartStatus = cs;
    }
    getChartStatus(): IChart {
        return this.chartStatus;
    }
    setCharts(charts: string[]): void {
        this.chartStatus.charts = charts;
    }
    getCharts(): string[] {
        return this.chartStatus.charts;
    }
    setSelection(selection: string[]): void {
        this.chartStatus.selection = selection;
    }
    getSelection(): string[] {
        return this.chartStatus.selection;
    }
    setSuggestion(suggestion: boolean): void {
        this.chartStatus.suggestion = suggestion;
    }
    getSuggestion(): boolean{
        return this.chartStatus.suggestion;
    }
}

