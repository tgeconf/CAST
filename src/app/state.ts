import { canisGenerator, canis, ICanisSpec } from './canisGenerator'
import { ChartSpec } from 'canis_toolkit'
import { ViewToolBtn } from '../components/viewWindow'
import Renderer from './renderer'
import Tool from '../util/tool'
import { ISortDataAttr, IDataItem } from './ds'
import Util from './util'
import Reducer from './reducer'
import * as action from './action'

export interface IState {
    sortDataAttrs: ISortDataAttr[]
    dataTable: Map<string, IDataItem>
    dataOrder: string[]

    //chart status
    charts: string[]
    tool: string
    selection: string[]
    suggestion: boolean

    //keyframe status
    // keyframeStatus: IKeyframe
}

/**
 * re-render parts when the state changes
 */
class State implements IState {
    _sortDataAttrs: ISortDataAttr[] = [];
    _dataTable: Map<string, IDataItem> = new Map();
    _dataOrder: string[]

    _charts: string[]
    _tool: string
    _selection: string[]
    _suggestion: boolean
    // keyframeStatus: IKeyframe

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
            console.log('data attributes unchanged!!!');
            //find sort reference
            const attrAndOrder: ISortDataAttr = Util.findUpdatedAttrOrder(sda);
            //reorder data items
            Reducer.triger(action.UPDATE_DATA_ORDER, Util.sortDataTable(attrAndOrder));
            Renderer.renderDataTable(this.dataTable, this.sortDataAttrs);
        }
        this._sortDataAttrs = sda;
        console.log(this);
    }
    get sortDataAttrs(): ISortDataAttr[] {
        return this._sortDataAttrs;
    }
    set dataTable(dt: Map<string, IDataItem>) {
        this._dataTable = dt;
        Renderer.renderDataTable(dt, this.sortDataAttrs);
        console.log(this);
    }
    get dataTable(): Map<string, IDataItem> {
        return this._dataTable;
    }
    set dataOrder(dord: string[]) {
        this._dataOrder = dord;
        console.log(this);
    }
    get dataOrder(): string[] {
        return this._dataOrder;
    }
    set charts(cs: string[]) {
        this._charts = cs;
        Renderer.generateAndRenderSpec(this);

        console.log(this);
    }
    get charts(): string[] {
        return this._charts;
    }
    set tool(t: string) {
        this._tool = t;
        Renderer.renderChartTool(t);
        console.log(this);
    }
    get tool(): string {
        return this._tool;
    }
    set selection(sel: string[]) {
        this._selection = sel;
        Renderer.renderSelectedMarks(this._selection);
        console.log(this);
    }
    get selection(): string[] {
        return this._selection;
    }
    set suggestion(sug: boolean) {
        this._suggestion = sug;
        Renderer.renderSuggestionCheckbox(sug);
        console.log(this);
    }
    get suggestion(): boolean {
        return this._suggestion;
    }

    public reset(): void {
        this.sortDataAttrs = [];
        this.dataTable = new Map();
        this.dataOrder = [];

        this.charts = [];
        this.tool = ViewToolBtn.SINGLE;
        this.selection = [];
        this.suggestion = true;
    }

}

export let state = new State();