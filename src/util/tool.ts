import { ICoord } from './ds'
import { state, State } from '../app/state'
import { player } from '../components/player'
import Rectangular from './rectangular'
import Lasso from './lasso'
import Reducer from '../app/reducer'
import { dragableCanvas } from '../components/widgets/dragableCanvas'
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
    // public static resizeSVG(svg: HTMLElement, w: number, h: number): void {
    //     if (svg.getAttribute('viewBox')) {
    //         let oriViewbox: string[] = svg.getAttribute('viewBox').split(' ');
    //         svg.setAttribute('width', w.toString());
    //         svg.setAttribute('height', h.toString())
    //         svg.setAttribute('viewBox', oriViewbox[0] + ' ' + oriViewbox[1] + ' ' + w + ' ' + h);
    //     }
    // }
    public static formatTime(time: number): string {
        const minute: number = Math.floor(time / 60000);
        const second: number = Math.floor((time - minute * 60000) / 1000);
        const ms: number = Math.floor((time - minute * 60000 - second * 1000) / 1);
        const minStr: string = minute < 10 ? '0' + minute : '' + minute;
        const secStr: string = second < 10 ? '0' + second : '' + second;
        const msStr = ms < 100 ? (ms < 10 ? '00' + ms : '0' + ms) : '' + ms;
        return minStr + ':' + secStr + '.' + msStr;
    }
    public static svg2canvas(svgElement: HTMLElement, canvas: HTMLCanvasElement) {
        // const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgString = svgElement.outerHTML;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        const svg = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svg);
        img.onload = function () {
            let dx = 0, dy = 0, scaleWidth = canvas.width, scaleHeight = canvas.width * (img.height / img.width);
            if (scaleHeight <= canvas.height) {
                dy = (canvas.height - scaleHeight) / 2;
            } else {
                scaleHeight = canvas.height;
                scaleWidth = canvas.height * (img.width / img.height);
                dx = (canvas.width - scaleWidth) / 2;
            }
            ctx.drawImage(img, dx, dy, scaleWidth, scaleHeight);
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }

    public static identicalArrays(arr1: any[], arr2: any[]): boolean {
        let same: boolean = true;
        if (arr1.length !== arr2.length) {
            same = false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (arr2.indexOf(arr1[i]) < 0) {
                same = false;
                break;
            }
        }
        return same;
    }
    public static resizeWidgets(svgContainerId: string = ''): void {
        // this.resizeSvgContainer(svgContainerId);
        this.resizePlayerContainer();
    }

    // public static resizeSvgContainer(svgContainerId: string = ''): void {
    //     //resize svg containers
    //     const svgs: HTMLElement[] = Array.from(svgContainerId === '' ? document.querySelectorAll('.view-content svg') : document.getElementById(svgContainerId).querySelectorAll('.view-content svg'));
    //     svgs.forEach((svg) => {
    //         const viewContent: HTMLElement = svg.parentElement;
    //         Tool.resizeSVG(svg, viewContent.offsetWidth, viewContent.offsetHeight);
    //     })
    // }

    public static resizePlayerContainer(): void {
        //resize player
        player.resizePlayer(player.widget.clientWidth - 160);
    }

    public static screenToSvgCoords(svg: any, x: number, y: number): ICoord {
        let rectPosiPoint1 = svg.createSVGPoint();
        rectPosiPoint1.x = x;
        rectPosiPoint1.y = y;
        return rectPosiPoint1.matrixTransform(svg.getScreenCTM().inverse());
    }

    //TODO: coord problem
    public static initLassoSelection(containerId: string): void {
        document.getElementById(containerId).onmousedown = (downEvt) => {
            const lassoSelection = new Lasso();
            const evtTarget: HTMLElement = <HTMLElement>downEvt.target;
            if (evtTarget.id === 'highlightSelectionFrame' ||
                (evtTarget.classList.contains('mark') && state.selection.includes(evtTarget.id) && state.selection.length > 0)) {//clicked within the selection frame

            } else {//doing selection
                const svg: HTMLElement = document.getElementById('visChart');
                if (svg) {
                    const svgBBox = svg.getBoundingClientRect();
                    const originX = downEvt.pageX - svgBBox.x, originY = downEvt.pageY - svgBBox.y;
                    let isDragging: boolean = true;
                    //create selection frame
                    lassoSelection.createSelectionFrame(svg, { x: originX, y: originY });
                    document.onmousemove = (moveEvt) => {
                        if (isDragging) {
                            const pathCoord: ICoord = { x: moveEvt.pageX - svgBBox.x, y: moveEvt.pageY - svgBBox.y };
                            const possibleMarks: string[] = lassoSelection.lassoSelect(state.selection);
                            //can't move outside the view
                            if (pathCoord.x >= 0 && pathCoord.x <= document.getElementById('chartContainer').offsetWidth && pathCoord.y >= 0 && pathCoord.y <= document.getElementById('chartContainer').offsetHeight) {
                                lassoSelection.updatePath(pathCoord);
                            }
                        }
                    }
                    document.onmouseup = (upEvt) => {
                        isDragging = false;
                        const selectedMarks: string[] = lassoSelection.lassoSelect(state.selection);
                        //save histroy before update state
                        State.tmpStateBusket.push([action.UPDATE_SELECTION, state.selection]);
                        State.saveHistory();
                        if (this.identicalArrays(selectedMarks, state.selection)) {
                            Reducer.triger(action.UPDATE_SELECTION, []);
                        } else {
                            Reducer.triger(action.UPDATE_SELECTION, selectedMarks);
                        }

                        lassoSelection.removeSelectionFrame();
                        document.onmousemove = null;
                        document.onmouseup = null;
                    }
                }
            }
        }
    }
    public static initRectangularSelection(containerId: string): void {
        const rectangularSelection = new Rectangular();
        document.getElementById(containerId).onmousedown = (downEvt) => {
            //get the scale of the chart since the size of the svg container is different from that of the chart
            let scaleW: number = 1, scaleH: number = 1;
            const svg: any = document.getElementById('visChart');
            if (svg) {
                scaleW = parseFloat(svg.getAttribute('width')) / document.getElementById('chartContainer').offsetWidth;
                scaleH = parseFloat(svg.getAttribute('height')) / document.getElementById('chartContainer').offsetHeight;
                console.log('svg scale : ', parseFloat(svg.getAttribute('width')), document.getElementById('chartContainer').offsetWidth, scaleW, scaleH);
            }

            const evtTarget: HTMLElement = <HTMLElement>downEvt.target;
            if (evtTarget.id === 'highlightSelectionFrame' ||
                (evtTarget.classList.contains('mark') && state.selection.includes(evtTarget.id) && state.selection.length > 0)) {//clicked within the selection frame
                dragableCanvas.createCanvas(
                    document.querySelector('#' + containerId + ' > svg:first-of-type'),
                    document.getElementById('highlightSelectionFrame').getBoundingClientRect(),
                    { x: downEvt.pageX, y: downEvt.pageY });
            } else {//doing selection
                if (svg) {
                    const svgBBox = svg.getBoundingClientRect();
                    console.log(svgBBox);
                    // let rectPosiPoint1 = svg.createSVGPoint();
                    // rectPosiPoint1.x = downEvt.pageX;
                    // rectPosiPoint1.y = downEvt.pageY;
                    // const rectPosi1: ICoord = rectPosiPoint1.matrixTransform(svg.getScreenCTM().inverse());
                    const rectPosi1: ICoord = this.screenToSvgCoords(svg, downEvt.pageX, downEvt.pageY);
                    let lastMouseX = downEvt.pageX, lastMouseY = downEvt.pageY;
                    let isDragging: boolean = true;
                    //create the selection frame
                    rectangularSelection.createSelectionFrame(svg);
                    document.onmousemove = (moveEvt) => {
                        if (isDragging) {
                            // let rectPosiPoint2 = svg.createSVGPoint();
                            // rectPosiPoint2.x = moveEvt.pageX;
                            // rectPosiPoint2.y = moveEvt.pageY;
                            // const rectPosi2: ICoord = rectPosiPoint2.matrixTransform(svg.getScreenCTM().inverse());
                            const rectPosi2: ICoord = this.screenToSvgCoords(svg, moveEvt.pageX, moveEvt.pageY);

                            const possibleMarks: string[] = rectangularSelection.rectangularSelect({
                                x1: rectPosi1.x,
                                y1: rectPosi1.y,
                                x2: rectPosi2.x,
                                y2: rectPosi2.y
                            }, state.selection);

                            //can't move outside the view
                            if ((moveEvt.pageX - svgBBox.x) >= 0 &&
                                (moveEvt.pageX - svgBBox.x) <= document.getElementById('chartContainer').offsetWidth &&
                                (moveEvt.pageY - svgBBox.y) >= 0 &&
                                (moveEvt.pageY - svgBBox.y) <= document.getElementById('chartContainer').offsetHeight) {
                                const tmpX = (rectPosi2.x < rectPosi1.x ? rectPosi2.x : rectPosi1.x);
                                const tmpY = (rectPosi2.y < rectPosi1.y ? rectPosi2.y : rectPosi1.y);
                                const tmpWidth = Math.abs(rectPosi1.x - rectPosi2.x);
                                const tmpHeight = Math.abs(rectPosi1.y - rectPosi2.y);

                                /* update the selection frame */
                                console.log('selection frame: ', tmpX, tmpY);
                                rectangularSelection.updateSelectionFrame({ x1: tmpX, y1: tmpY, x2: tmpX + tmpWidth, y2: tmpY + tmpHeight });
                            }
                        }
                    }
                    document.onmouseup = (upEvt) => {
                        isDragging = false;
                        const mouseMoveThsh: number = 3;//mouse move less than 3px -> single selection; bigger than 3px -> rect selection
                        //save histroy before update state
                        State.tmpStateBusket.push([action.UPDATE_SELECTION, state.selection]);
                        State.saveHistory();
                        if (Tool.pointDist(lastMouseX, upEvt.pageX, lastMouseY, upEvt.pageY) > mouseMoveThsh) {//doing rect selection
                            // let rectPosiPoint2 = svg.createSVGPoint();
                            // rectPosiPoint2.x = upEvt.pageX;
                            // rectPosiPoint2.y = upEvt.pageY;
                            // const rectPosi2: ICoord = rectPosiPoint2.matrixTransform(svg.getScreenCTM().inverse());
                            const rectPosi2: ICoord = this.screenToSvgCoords(svg, upEvt.pageX, upEvt.pageY);
                            const selectedMarks: string[] = rectangularSelection.rectangularSelect({
                                x1: rectPosi1.x,
                                y1: rectPosi1.y,
                                x2: rectPosi2.x,
                                y2: rectPosi2.y
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