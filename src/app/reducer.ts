import { state } from './state'
import { TDataItem, TSortDataAttr, TKeyframe } from './ds'
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

Reducer.listen(action.UPDATE_DATA_SORT, (sdaArr: TSortDataAttr[]) => {
    console.log('updating data sort!', sdaArr);
    //filter the attributes, remove the ones that are not data attributes
    state.sortDataAttrs = Util.filterDataSort(sdaArr);
})
Reducer.listen(action.UPDATE_DATA_ORDER, (dord: string[]) => {
    console.log('updating data order!');
    state.dataOrder = dord;
})
Reducer.listen(action.UPDATE_DATA_TABLE, (dt: Map<string, TDataItem>) => {
    console.log('updating data table!', dt);
    state.dataTable = dt;
})
Reducer.listen(action.LOAD_CHARTS, (chartContent: string[]) => {
    console.log('loading charts!', chartContent);
    document.getElementById('chartContainer').innerHTML = '';
    state.charts = chartContent;
})
Reducer.listen(action.TOGGLE_SUGGESTION, (suggestion: boolean) => {
    console.log('updating suggestion!');
    state.suggestion = suggestion;
})
Reducer.listen(action.UPDATE_SELECTION, (selection: string[]) => {
    console.log('updating selection!');
    if (state.suggestion && selection.length > 0) {
        selection = Util.suggestSelection(selection);
    }
    state.selection = selection;
})
Reducer.listen(action.UPDATE_LOTTIE, (lai: AnimationItem) => {
    console.log('updating lottie');
    state.lottieAni = lai;
})
Reducer.listen(action.UPDATE_HIDDEN_LOTTIE, (hl: AnimationItem) => {
    state.hiddenLottie = hl;
})
Reducer.listen(action.UPDATE_KEYFRAME_TIME_POINTS, (frameTime: Map<number, boolean>) => {
    const frameTimeArr: Array<[number, boolean]> = [[0, true], ...frameTime];
    frameTimeArr.sort((a, b) => a[0] - b[0]);
    let isContinued: boolean = true;
    let keyframes: TKeyframe[] = [];
    frameTimeArr.forEach(ft => {
        if (ft[1]) {
            keyframes.push(<TKeyframe>{
                continued: isContinued,
                timePoint: ft[0],
            })
        }
        isContinued = ft[1];
    })
    state.keyframes = keyframes;
})
Reducer.listen(action.UPDATE_GEOUPING_AND_TIMING, (animations: Map<string, any>) => {
    const gat: any = [];
    animations.forEach((ani: any, selection: string) => {
        gat.push(ani);
    })
    state.groupingAndTiming = gat;
})