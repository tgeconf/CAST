import { IState, IChart } from './state'
import Canis from 'canis_toolkit';
export let canis = new Canis();

interface IChartSpec {
    id?: string
    type?: string
    source: string
}

interface ISort {
    field: string
    order: string | string[]
}

interface IGrouping {
    reference: string
    delay: number
    groupBy: string
    sort: ISort
    grouping: IGrouping
}

interface IOffset {
    field: string
    minOffset: number
}

interface IDuration {
    field: string
    minDuration: number
}

interface IAction {
    reference: string
    offset: number | IOffset
    type: string
    easing: string
    duration: number | IDuration
}

interface IAnimationSpec {
    reference: string
    offset: number | IOffset
    selection: string
    grouping: IGrouping
    actions: IAction[]
}

interface ICanisSpec {
    charts: IChartSpec[]
    animations: IAnimationSpec[]
}

class CanisGenerator {
    public canisSpec: ICanisSpec;

    public generate(state: IState) {

    }

    public validate() {

    }
}

export let canisGenerator = new CanisGenerator();