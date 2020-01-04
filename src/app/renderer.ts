import { IState } from './state'
import { canisGenerator, canis } from './canisGenerator'
import { ViewToolBtn } from '../components/viewWindow'

/**
 * render html according to the state
 */
export default class Renderer {
    public static generateAndRenderSpec(s: IState): void {
        canisGenerator.generate(s);
        canis.renderSpec(canisGenerator.canisSpec, () => { });
    }
    public static renderSuggestionCheckbox(suggesting: boolean): void {
        (<HTMLInputElement>document.getElementById('suggestBox')).checked = suggesting;
    }
    public static renderChartTool(t: string): void {
        switch (t) {
            case ViewToolBtn.SINGLE:
                (<HTMLElement>document.getElementsByClassName('arrow-icon')[0]).click();
                break;
            case ViewToolBtn.LASSO:
                (<HTMLElement>document.getElementsByClassName('lasso-icon')[0]).click();
                break;
            case ViewToolBtn.DATA:
                (<HTMLElement>document.getElementsByClassName('table-icon')[0]).click();
                break;
        }
    }
}