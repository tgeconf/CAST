import { canisGenerator, canis, ICanisSpec } from './canisGenerator'

export interface IKeyframe {

}

export interface IState {
    //chart status
    charts: string[],
    selection: string[],
    suggestion: boolean,

    //keyframe status
    keyframeStatus: IKeyframe
}

/**
 * re-render parts when the state changes
 */
export class State implements IState {
    _charts: string[]
    _selection: string[]
    _suggestion: boolean
    keyframeStatus: IKeyframe

    constructor() {
        this._charts = [];
        this._selection = [];
        this._suggestion = true;
    }

    set charts(cs: string[]) {
        this._charts = cs;
        this.trigerSpecGenerator();
    }
    get charts(): string[] {
        return this._charts;
    }
    set selection(sel: string[]) {
        this._selection = sel;
        if(this.suggestion){//if the suggestion switch is on, then do suggestion

        }
    }
    get selection(): string[] {
        return this._selection;
    }
    set suggestion(sug: boolean) {
        this._suggestion = sug;
    }
    get suggestion(): boolean {
        return this._suggestion;
    }



    // set chartStatus(cs: IChart) {
    //     this._chartStatus = cs;
    //     this.trigerSpecGenerator();
    // }
    // get chartStatus(): IChart {
    //     return this._chartStatus;
    // }

    private trigerSpecGenerator(): void {
        canisGenerator.generate(this);
        this.renderSpec(canisGenerator.canisSpec);
    }

    private renderSpec(spec: ICanisSpec): void {
        canis.renderSpec(spec, () => { });
    }
}

export let state = new State();