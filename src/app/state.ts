import { canisGenerator, canis, ICanisSpec } from './canisGenerator'
import { ChartSpec } from 'canis_toolkit'
import { ViewToolBtn } from '../components/viewWindow'
import Renderer from './renderer'

export interface IKeyframe {

}

export interface ISortDataAttr {
    attr: string
    sort: string
}

export interface IDataItem {
    [propName: string]: string | number;
}

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
    keyframeStatus: IKeyframe
}

/**
 * re-render parts when the state changes
 */
class State implements IState {
    _sortDataAttrs: ISortDataAttr[]
    _dataTable: Map<string, IDataItem>
    _dataOrder: string[]

    _charts: string[]
    _tool: string
    _selection: string[]
    _suggestion: boolean
    keyframeStatus: IKeyframe

    set sortDataAttrs(sda: ISortDataAttr[]) {
        this._sortDataAttrs = sda;
        console.log(this);
    }
    get sortDataAttrs(): ISortDataAttr[] {
        return this._sortDataAttrs;
    }
    set dataTable(dt: Map<string, IDataItem>) {
        this._dataTable = dt;
        Renderer.renderDataTable(dt);
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