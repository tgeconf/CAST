export const LOAD_CHARTS = 'LOAD_CHARTS'
export type LOAD_CHARTS = typeof LOAD_CHARTS

export interface ILoadCharts {
    type: LOAD_CHARTS
    charts: string[]
}

export type ChartAction = ILoadCharts;

export function loadCharts(inputCharts: string[]): ILoadCharts {
    return {
        type: LOAD_CHARTS,
        charts: inputCharts
    }
}