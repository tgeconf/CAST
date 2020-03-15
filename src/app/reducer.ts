import { state } from './state'
import { IDataItem, ISortDataAttr, IKeyframeGroup } from './ds'
import * as action from './action'
import Util from './util'
import Lottie, { AnimationItem } from '../../node_modules/lottie-web/build/player/lottie'
import KfItem from '../components/widgets/kfItem'
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
    console.log('updating data sort!', sdaArr);
    //filter the attributes, remove the ones that are not data attributes
    state.sortDataAttrs = Util.filterDataSort(sdaArr);
})
Reducer.listen(action.UPDATE_DATA_ORDER, (dord: string[]) => {
    console.log('updating data order!');
    state.dataOrder = dord;
})
Reducer.listen(action.UPDATE_DATA_TABLE, (dt: Map<string, IDataItem>) => {
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
Reducer.listen(action.UPDATE_KEYFRAME_TRACKS, (animations: Map<string, any>) => {
    console.log('all animations: ', animations);
    //reset the min and max duraiton of KfItem
    KfItem.minDuration = 1000000;
    KfItem.maxDuration = 0;
    const rootGroup: IKeyframeGroup[] = [...animations].map((a: any) => Util.aniRootToKFGroup(a[1].root, a[0], ''));
    console.log('roots to generate the keyframe ', rootGroup);
    state.keyframeGroups = rootGroup;
})
Reducer.listen(action.UPDATE_KEYFRAME_CONTAINER_SLIDER, (kfGroupWidth: number) => {
    state.kfGroupWidth = kfGroupWidth;
})