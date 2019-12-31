import { state } from '../app/store'
import { chartReducer } from './chartReducer'
import * as action from '../actions/action'

export default class Reducer {
    static list: any = {};

    public static listen(key: string, fn: any): void {
        if (!this.list[key]) {
            this.list[key] = [];
        }
        this.list[key].push(fn);
    }

    public static triger(key: string, name: string): void {
        let fns = this.list[key];
        if (!fns || fns.length == 0) {
            return;
        }
        for (var i = 0, fn; fn = fns[i++];) {
            fn.apply(this, [name]);
        }
    }
}

Reducer.listen(action.LOAD_CHARTS, function (name: string) {
    console.log(`${name}想知道你结婚`);
    // state.chartStatus = chartReducer
})