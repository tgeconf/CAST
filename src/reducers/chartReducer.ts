import { IChart } from '../app/store'
import { LOAD_CHARTS, ChartAction } from '../actions/chartAction'

export const chartReducer = (state: IChart, action: ChartAction): IChart => {
    switch (action.type) {
        case LOAD_CHARTS:
            return { ...state, charts: action.charts }
    }
    return state;
}