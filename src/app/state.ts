import { canisGenerator, canis, ICanisSpec } from './canisGenerator'
import { ChartSpec } from 'canis_toolkit'
import { ViewToolBtn } from '../components/viewWindow'
import Renderer from './renderer'

export interface IKeyframe {

}

export interface IState {
    //chart status
    charts: string[],
    tool: string,
    selection: string[],
    suggestion: boolean,

    //keyframe status
    keyframeStatus: IKeyframe
}

/**
 * re-render parts when the state changes
 */
class State implements IState {
    _charts: string[]
    _tool: string
    _selection: string[]
    _suggestion: boolean
    keyframeStatus: IKeyframe

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
        this.charts = [];
        this.tool = ViewToolBtn.SINGLE;
        this.selection = [];
        this.suggestion = true;
    }

}

export let state = new State();