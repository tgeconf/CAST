import { state } from './state'
import { IDataItem, ISortDataAttr } from './ds'
import * as action from './action'
import Util from './util'
import Renderer from './renderer';
import Lottie, { AnimationItem } from '../../node_modules/lottie-web/build/player/lottie'
export default class Reducer {
    static list: any = {};

    public static listen(key: string, fn: any): void {
        if (!this.list[key]) {
            this.list[key] = [];
        }
        this.list[key].push(fn);
    }

    public static triger(key: string, prop: any): void {
        let fns = this.list[key];
        if (!fns || fns.length == 0) {
            return;
        }
        for (var i = 0, fn; fn = fns[i++];) {
            fn.apply(this, [prop]);
        }
    }
}

Reducer.listen(action.UPDATE_DATA_SORT, (sdaArr: ISortDataAttr[]) => {
    state.sortDataAttrs = sdaArr;
})
Reducer.listen(action.UPDATE_DATA_ORDER, (dord: string[]) => {
    state.dataOrder = dord;
})
Reducer.listen(action.UPDATE_DATA_TABLE, (dt: Map<string, IDataItem>) => {
    state.dataTable = dt;
})
Reducer.listen(action.LOAD_CHARTS, (chartContent: string[]) => {
    state.charts = chartContent;
})
Reducer.listen(action.TOGGLE_SUGGESTION, (suggestion: boolean) => {
    state.suggestion = suggestion;
})
Reducer.listen(action.UPDATE_SELECTION, (selection: string[]) => {
    if (state.suggestion && selection.length > 0) {
        selection = Util.suggestSelection(selection);
    }
    state.selection = selection;
})

Reducer.listen(action.UPDATE_LOTTIE, (lai: AnimationItem) => {
    state.lottieAni = lai;
})