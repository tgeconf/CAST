export interface IChart {
    charts: string[],
    selection: string[],
    suggestion: boolean
}

export interface IStore {
    chartStatus: IChart
}

interface IState {
    chartStatus: IChart
    setChartStatus(cs: IChart): void
    getChartStatus(): IChart
}

class State implements IState {
    chartStatus: IChart
    setChartStatus(cs: IChart): void {
        this.chartStatus = cs;
    }
    getChartStatus(): IChart {
        return this.chartStatus;
    }
}

class Proxy implements IState {
    private state: State;
    chartStatus: IChart;

    constructor(state: State) {
        this.state = state;
    }

    private trigerSpecGenerator(){
        console.log('going to generate spec');
    }

    setChartStatus(cs: IChart): void {
        this.state.setChartStatus(cs);
        this.trigerSpecGenerator();
    }
    getChartStatus(): IChart {
        return this.state.chartStatus;
    }
}

export let state = new Proxy(new State());