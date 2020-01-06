import { IState } from './state'
import { ChartSpec } from 'canis_toolkit'
import { canisGenerator, canis } from './canisGenerator'
import { ViewToolBtn } from '../components/viewWindow'
import Util from './util'
import Tool from '../util/tool'

/**
 * render html according to the state
 */
export default class Renderer {
    /**
     * generate the canis spec and render
     * @param s : state
     */
    public static generateAndRenderSpec(s: IState): void {
        canisGenerator.generate(s);
        canis.renderSpec(canisGenerator.canisSpec, () => { Util.determinAttrType(ChartSpec.dataMarkDatum); });
        //add highlight box on the chart
        const svg: HTMLElement = document.getElementById('visChart');
        if (svg) {
            //create the highlight box
            const highlightBox: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            highlightBox.setAttributeNS(null, 'id', 'highlightSelectionFrame');
            highlightBox.setAttributeNS(null, 'class', 'highlight-selection-frame');
            highlightBox.setAttributeNS(null, 'fill', 'rgba(255, 255, 255, 0.01)');
            highlightBox.setAttributeNS(null, 'stroke', '#2196f3');
            highlightBox.setAttributeNS(null, 'stroke-width', '2');
            svg.appendChild(highlightBox);
            Tool.resizeSVG(svg, svg.parentElement.offsetWidth, svg.parentElement.offsetHeight);
        }
    }

    /**
     * render the suggestion checkbox status
     * @param suggesting 
     */
    public static renderSuggestionCheckbox(suggesting: boolean): void {
        (<HTMLInputElement>document.getElementById('suggestBox')).checked = suggesting;
    }

    /**
     * set the selection tool status
     * @param t 
     */
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

    /**
     * set the style of the selected marks and the highlight box
     * @param selection 
     */
    public static renderSelectedMarks(selection: string[]): void {
        let highlightSelectionBox: HTMLElement = document.getElementById('highlightSelectionFrame');
        if (selection.length === 0) {//no mark is selected
            if (highlightSelectionBox) {
                //reset highlightselectionbox
                highlightSelectionBox.setAttributeNS(null, 'x', '0');
                highlightSelectionBox.setAttributeNS(null, 'y', '0');
                highlightSelectionBox.setAttributeNS(null, 'width', '0');
                highlightSelectionBox.setAttributeNS(null, 'height', '0');
            }
            //reset all marks to un-selected
            Array.from(document.getElementsByClassName('non-framed-mark')).forEach((m: HTMLElement) => {
                m.classList.remove('non-framed-mark');
            })
        } else {
            //find the boundary of the selected marks
            let minX = 10000, minY = 10000, maxX = -10000, maxY = -10000;
            Array.from(document.getElementsByClassName('mark')).forEach((m: HTMLElement) => {
                const markId: string = m.id;
                if (selection.includes(markId)) {//this is a selected mark
                    m.classList.remove('non-framed-mark');
                    const tmpBBox = (<SVGGraphicsElement><unknown>m).getBBox();
                    minX = tmpBBox.x < minX ? tmpBBox.x : minX;
                    minY = tmpBBox.y < minY ? tmpBBox.y : minY;
                    maxX = tmpBBox.x + tmpBBox.width > maxX ? (tmpBBox.x + tmpBBox.width) : maxX;
                    maxY = tmpBBox.y + tmpBBox.height > maxY ? (tmpBBox.y + tmpBBox.height) : maxY;
                } else {//this is not a selected mark
                    m.classList.add('non-framed-mark');
                }
            })
            if (highlightSelectionBox) {
                //set the highlightSelectionFrame
                highlightSelectionBox.setAttributeNS(null, 'x', (minX - 5).toString());
                highlightSelectionBox.setAttributeNS(null, 'y', (minY - 5).toString());
                highlightSelectionBox.setAttributeNS(null, 'width', (maxX - minX + 10).toString());
                highlightSelectionBox.setAttributeNS(null, 'height', (maxY - minY + 10).toString());
            }
        }

    }
}