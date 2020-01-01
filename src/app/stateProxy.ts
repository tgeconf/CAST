import { State, IState, IChart } from './state'
import { canisGenerator } from './canisGenerator'

class Proxy implements IState {
    private state: State;
    chartStatus: IChart;

    constructor(state: State) {
        this.state = state;
    }

    private trigerSpecGenerator() {
        console.log('going to generate spec', this.state);
        //using the current state to generate canis spec
        
    }

    setChartStatus(cs: IChart): void {
        this.state.setChartStatus(cs);
        this.trigerSpecGenerator();
    }
    getChartStatus(): IChart {
        return this.state.chartStatus;
    }
    setCharts(charts: string[]): void {
        this.chartStatus.charts = charts;
        this.trigerSpecGenerator();
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
    getSuggestion(): boolean {
        return this.chartStatus.suggestion;
    }
}

export let state = new Proxy(new State());