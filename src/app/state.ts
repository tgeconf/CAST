import { ChartSpec } from 'canis_toolkit'
import { ViewToolBtn } from '../components/viewWindow'
import Renderer from './renderer'
import Tool from '../util/tool'
import { ISortDataAttr, IDataItem, IKeyframeGroup, IKfGroupSize, IPath } from './core/ds'
import Util from './core/util'
import Reducer from './reducer'
import * as action from './action'
import Lottie, { AnimationItem } from '../../node_modules/lottie-web/build/player/lottie';
import CanisGenerator, { ICanisSpec } from './core/canisGenerator'


export interface IState {
    sortDataAttrs: ISortDataAttr[]
    dataTable: Map<string, IDataItem>
    dataOrder: string[]

    //chart status
    charts: string[]
    tool: string
    selection: string[]
    suggestion: boolean


    spec: ICanisSpec
    allPaths: IPath[]//for kf suggestion
    //keyframe status
    // keyframeStatus: IKeyframe
    kfGroupSize: IKfGroupSize // size of all kf groups

    //video
    lottieAni: AnimationItem
    // hiddenLottie: AnimationItem
    keyframeGroups: IKeyframeGroup[]//each keyframe group correspond to one root from one aniunit
    staticMarks: string[]
    // groupingAndTiming: any
}

/**
 * re-render parts when the state changes
 */
export class State implements IState {
    _sortDataAttrs: ISortDataAttr[] = [];
    _dataTable: Map<string, IDataItem> = new Map();
    _dataOrder: string[]

    _charts: string[]
    _tool: string
    _selection: string[]
    _suggestion: boolean
    _spec: ICanisSpec
    _allPaths: IPath[]
    _kfGroupSize: IKfGroupSize

    _lottieAni: AnimationItem
    _hiddenLottie: AnimationItem
    _keyframeGroups: IKeyframeGroup[]
    _staticMarks: string[]
    // _groupingAndTiming: any

    set sortDataAttrs(sda: ISortDataAttr[]) {
        //compare incoming
        let sameAttrs: boolean = true;
        if (sda.length !== this._sortDataAttrs.length) {
            sameAttrs = false;
        } else {
            let oriAttrs: string[] = this._sortDataAttrs.map(a => { return a.attr });
            let newAttrs: string[] = sda.map(a => { return a.attr });
            sameAttrs = Tool.identicalArrays(oriAttrs, newAttrs);
        }

        if (!sameAttrs) {
            Renderer.renderDataAttrs(sda);
        } else {
            //find sort reference
            const [found, attrAndOrder] = Util.findUpdatedAttrOrder(sda);
            //reorder data items
            if (found) {
                Reducer.triger(action.UPDATE_DATA_ORDER, Util.sortDataTable(attrAndOrder));
                Renderer.renderDataTable(this.dataTable);
            }


        }
        //State.saveHistory(action.UPDATE_DATA_SORT, this._sortDataAttrs);
        this._sortDataAttrs = sda;
    }
    get sortDataAttrs(): ISortDataAttr[] {
        return this._sortDataAttrs;
    }
    set dataTable(dt: Map<string, IDataItem>) {
        //State.saveHistory(action.UPDATE_DATA_TABLE, this._dataTable);
        this._dataTable = dt;
        Renderer.renderDataTable(this.dataTable);
    }
    get dataTable(): Map<string, IDataItem> {
        return this._dataTable;
    }
    set dataOrder(dord: string[]) {
        this._dataOrder = dord;
    }
    get dataOrder(): string[] {
        return this._dataOrder;
    }
    set charts(cs: string[]) {
        //State.saveHistory(action.LOAD_CHARTS, this._charts);
        this._charts = cs;
        Reducer.triger(action.UPDATE_SPEC_CHARTS, this.charts);
        // Renderer.generateAndRenderSpec(this);
    }
    get charts(): string[] {
        return this._charts;
    }
    set tool(t: string) {
        this._tool = t;
        Renderer.renderChartTool(this.tool);
    }
    get tool(): string {
        return this._tool;
    }
    set selection(sel: string[]) {
        //State.saveHistory(action.UPDATE_SELECTION, this._selection);
        this._selection = sel;
        Renderer.renderSelectedMarks(this.selection);
    }
    get selection(): string[] {
        return this._selection;
    }
    set suggestion(sug: boolean) {
        //State.saveHistory(action.TOGGLE_SUGGESTION, this._suggestion);
        this._suggestion = sug;
        // Renderer.renderSuggestionCheckbox(this.suggestion);
    }
    get suggestion(): boolean {
        return this._suggestion;
    }
    set kfGroupSize(kfgSize: IKfGroupSize) {
        this._kfGroupSize = kfgSize;
        Renderer.renderKfContainerSliders(this.kfGroupSize);
    }
    get kfGroupSize(): IKfGroupSize {
        return this._kfGroupSize;
    }
    set lottieAni(lai: AnimationItem) {
        this._lottieAni = lai;
    }
    get lottieAni(): AnimationItem {
        return this._lottieAni;
    }
    // set hiddenLottie(hl: AnimationItem) {
    //     this._hiddenLottie = hl;
    // }
    // get hiddenLottie(): AnimationItem {
    //     return this._hiddenLottie;
    // }
    set keyframeGroups(kfts: IKeyframeGroup[]) {
        if (kfts) {
            this._keyframeGroups = kfts;
            //render keyframes
            Renderer.renderKeyframeTracks(this.keyframeGroups);
        }
    }
    get keyframeGroups(): IKeyframeGroup[] {
        return this._keyframeGroups;
    }
    set staticMarks(sm: string[]) {
        this._staticMarks = sm;
        Renderer.renderStaticKf(this.staticMarks);
    }
    get staticMarks(): string[] {
        return this._staticMarks;
    }
    set spec(canisSpec: ICanisSpec) {
        console.log('going to validate spec: ', canisSpec);
        //validate spec before render
        const validSpec: boolean = CanisGenerator.validate(canisSpec);
        if (validSpec) {
            this._spec = canisSpec;
            Renderer.renderSpec(this.spec);
        }
    }
    get spec(): ICanisSpec {
        return this._spec;
    }
    set allPaths(ap: IPath[]) {
        this._allPaths = ap;
    }
    get allPaths(): IPath[] {
        return this._allPaths;
    }

    public reset(): void {
        this.sortDataAttrs = [];
        this.dataTable = new Map();
        this.dataOrder = [];

        this.charts = [];
        this.tool = ViewToolBtn.SINGLE;
        this.selection = [];
        this.suggestion = true;

        this.keyframeGroups = null;
        // this.groupingAndTiming = null;
    }

    static stateHistory: Array<Array<[string, any]>> = [];//each step might triger multiple actions, thus each step correspond to one Array<[actionType, stateAttrValue]>
    static stateHistoryIdx: number = 0;
    static tmpStateBusket: Array<[string, any]> = [];
    public static saveHistory() {
        this.stateHistory = this.stateHistory.slice(0, this.stateHistoryIdx);
        this.stateHistory.push(this.tmpStateBusket);
        this.stateHistoryIdx++;
        this.tmpStateBusket = [];
        // console.log('current history: ', this.stateHistory);
    }

    public static revertHistory() {
        if (this.stateHistoryIdx > 0) {
            this.stateHistoryIdx--;
            const actionAndValues: Array<[string, any]> = this.stateHistory[this.stateHistoryIdx];
            actionAndValues.forEach(actionValue => {
                Reducer.triger(actionValue[0], actionValue[1]);
            })
        }
    }

    public static redoHistory() {
        if (this.stateHistoryIdx < this.stateHistory.length - 1) {
            this.stateHistoryIdx++;
            const actionAndValues: Array<[string, any]> = this.stateHistory[this.stateHistoryIdx];
            actionAndValues.forEach(actionValue => {
                Reducer.triger(actionValue[0], actionValue[1]);
            })
        }
    }

}

export let state = new State();