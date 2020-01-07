import { IBoundary } from './ds'
import { state } from '../app/state'
import Rectangular from './rectangular'
import Reducer from '../app/reducer'
import * as action from '../app/action'

export default class Tool {
    public static firstLetterUppercase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    public static pointDist(x1: number, x2: number, y1: number, y2: number): number {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }
    public static arrayContained(a: any[], b: any[]): boolean {
        if (a.length < b.length) return false;
        for (var i = 0, len = b.length; i < len; i++) {
            if (a.indexOf(b[i]) == -1) return false;
        }
        return true;
    }
    public static resizeSVG(svg: HTMLElement, w: number, h: number): void {
        let oriViewbox: string[] = svg.getAttribute('viewBox').split(' ');
        svg.setAttribute('width', w.toString());
        svg.setAttribute('height', h.toString())
        svg.setAttribute('viewBox', oriViewbox[0] + ' ' + oriViewbox[1] + ' ' + w + ' ' + h);
    }
    public static initRectangularSelection(containerId: string) {
        const rectangularSelection = new Rectangular();
        document.getElementById(containerId).onmousedown = (downEvt) => {
            const evtTarget: HTMLElement = <HTMLElement>downEvt.target;
            if (evtTarget.id === 'highlightSelectionFrame' ||
                (evtTarget.classList.contains('mark') && state.selection.includes(evtTarget.id) && state.selection.length > 0)) {//clicked within the selection frame

            } else {//doing selection
                const svg: HTMLElement = document.getElementById('visChart');
                if (svg) {
                    const svgBBox = svg.getBoundingClientRect();
                    const rectPosi1X = downEvt.pageX - svgBBox.x, rectPosi1Y = downEvt.pageY - svgBBox.y;
                    let lastMouseX = downEvt.pageX, lastMouseY = downEvt.pageY;
                    let isDragging = true;
                    //create the selection frame
                    rectangularSelection.createSelectionFrame(svg);
                    document.onmousemove = (moveEvt) => {
                        if (isDragging) {
                            const rectPosi2X = moveEvt.pageX - svgBBox.x, rectPosi2Y = moveEvt.pageY - svgBBox.y;
                            const possibleMarks: string[] = rectangularSelection.rectangularSelect({
                                x1: rectPosi1X,
                                y1: rectPosi1Y,
                                x2: rectPosi2X,
                                y2: rectPosi2Y
                            }, state.selection);

                            //can't move outside the view
                            if (rectPosi2X >= 0 && rectPosi2X <= document.getElementById('chartContainer').offsetWidth && rectPosi2Y >= 0 && rectPosi2Y <= document.getElementById('chartContainer').offsetHeight) {
                                const tmpX = rectPosi2X < rectPosi1X ? rectPosi2X : rectPosi1X;
                                const tmpY = rectPosi2Y < rectPosi1Y ? rectPosi2Y : rectPosi1Y;
                                const tmpWidth = Math.abs(rectPosi1X - rectPosi2X);
                                const tmpHeight = Math.abs(rectPosi1Y - rectPosi2Y);

                                /* update the selection frame */
                                rectangularSelection.updateSelectionFrame({ x1: tmpX, y1: tmpY, x2: tmpX + tmpWidth, y2: tmpY + tmpHeight });
                            }
                        }
                    }
                    document.onmouseup = (upEvt) => {
                        isDragging = false;
                        const mouseMoveThsh: number = 3;//mouse move less than 3px -> single selection; bigger than 3px -> rect selection
                        if (Tool.pointDist(lastMouseX, upEvt.pageX, lastMouseY, upEvt.pageY) > mouseMoveThsh) {//doing rect selection
                            const rectPosi2X = upEvt.pageX - svgBBox.x, rectPosi2Y = upEvt.pageY - svgBBox.y;
                            const selectedMarks: string[] = rectangularSelection.rectangularSelect({
                                x1: rectPosi1X,
                                y1: rectPosi1Y,
                                x2: rectPosi2X,
                                y2: rectPosi2Y
                            }, state.selection);
                            Reducer.triger(action.UPDATE_SELECTION, selectedMarks);
                        } else {//single selection
                            const clickedItem: HTMLElement = <HTMLElement>upEvt.target;
                            if (clickedItem.classList.contains('mark')) {//clicked on a mark
                                const clickedMarkId: string = clickedItem.id;
                                state.selection.includes(clickedMarkId) ?
                                    Reducer.triger(action.UPDATE_SELECTION, [...state.selection].splice(state.selection.indexOf(clickedMarkId), 1)) :
                                    Reducer.triger(action.UPDATE_SELECTION, [...state.selection, clickedMarkId]);
                            } else {//didnt select any mark
                                Reducer.triger(action.UPDATE_SELECTION, []);
                            }
                        }
                        rectangularSelection.removeSelectionFrame();
                        document.onmousemove = null;
                        document.onmouseup = null;
                    }
                }
            }
        }
    }


}