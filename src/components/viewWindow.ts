import '../assets/style/view-window.scss'
import ViewContent from './viewContent'
import { player } from './player'
import Slider from './slider'
import { lassoSelector } from './lassoSelector'
import Tool from '../util/tool'
import { state } from '../app/state'

interface IViewBtnProp {
    title?: string,
    clickEvtType: string,
    iconClass: string
}

export default class ViewWindow {
    static CHART_VIEW_TITLE: string = 'chart';
    static VIDEO_VIEW_TITLE: string = 'animation';
    static KF_VIEW_TITLE: string = '';

    viewTitle: string;
    view: HTMLDivElement;
    constructor(title: string) {
        this.viewTitle = title;
    }
    public createView() {
        this.view = document.createElement('div');
        this.view.className = 'view';

        const viewTitleContainer: HTMLDivElement = document.createElement('div');
        viewTitleContainer.className = 'view-title-container';
        if (this.viewTitle !== '') {
            const viewTitleText: HTMLSpanElement = document.createElement('span');
            viewTitleText.className = 'view-title-text';
            viewTitleText.innerHTML = Tool.firstLetterUppercase(this.viewTitle);
            viewTitleContainer.appendChild(viewTitleText);
        }

        this.view.appendChild(viewTitleContainer);

        const viewContent = new ViewContent();
        viewContent.createViewContent(this.viewTitle);
        this.view.appendChild(viewContent.container);

        //append view widgets
        switch (this.viewTitle) {
            case ViewWindow.CHART_VIEW_TITLE:
                this.view.appendChild(this.createChartWidget());
                break;
            case ViewWindow.VIDEO_VIEW_TITLE:
                this.view.appendChild(this.createPlayerWidget());
                break;
        }


        //create tools on the title
        switch (this.viewTitle) {
            case ViewWindow.CHART_VIEW_TITLE:
                viewTitleContainer.appendChild(this.createSelectionTools());
                break;
            case ViewWindow.VIDEO_VIEW_TITLE:
                break;
            case ViewWindow.KF_VIEW_TITLE:
                viewTitleContainer.classList.add('keyframe-title-container');
                viewTitleContainer.appendChild(this.createKfTools());
                break;
        }
    }

    public createSelectionTools(): HTMLDivElement {
        const toolContainer: HTMLDivElement = document.createElement('div');
        toolContainer.className = 'view-tool-container';
        toolContainer.appendChild(this.createSeparator());
        toolContainer.appendChild(this.createBtn({
            title: 'Selection',
            clickEvtType: ViewToolBtn.SINGLE,
            iconClass: 'arrow-icon'
        }));
        toolContainer.appendChild(this.createBtn({
            title: 'Lasso Selection',
            clickEvtType: ViewToolBtn.LASSO,
            iconClass: 'lasso-icon'
        }));
        toolContainer.appendChild(this.createSeparator());
        toolContainer.appendChild(this.createBtn({
            title: 'Select from Data',
            clickEvtType: ViewToolBtn.DATA,
            iconClass: 'table-icon'
        }));
        toolContainer.appendChild(this.createSeparator());
        return toolContainer;
    }

    public createKfTools(): HTMLDivElement {
        const toolContainer = document.createElement('div');
        toolContainer.className = 'view-tool-container';
        toolContainer.appendChild(this.createBtn({
            title: 'Revert',
            clickEvtType: ViewToolBtn.REVERT,
            iconClass: 'revert-icon'
        }));
        toolContainer.appendChild(this.createBtn({
            title: 'Redo',
            clickEvtType: ViewToolBtn.REVERT,
            iconClass: 'redo-icon'
        }));
        toolContainer.appendChild(this.createSeparator());
        toolContainer.appendChild(this.createBtn({
            clickEvtType: ViewToolBtn.ZOOM,
            iconClass: 'zoom-icon'
        }));
        toolContainer.appendChild(this.createBtn({
            title: 'Zoom Out',
            clickEvtType: ViewToolBtn.ZOOM_OUT,
            iconClass: 'zoom-out-icon'
        }));
        //create zooming slider
        const slider: Slider = new Slider([0, 100], 50);
        toolContainer.appendChild(slider.createSlider());
        toolContainer.appendChild(this.createBtn({
            title: 'Zoom In',
            clickEvtType: ViewToolBtn.ZOOM_IN,
            iconClass: 'zoom-in-icon'
        }));
        return toolContainer;
    }

    public createSeparator(): HTMLSpanElement {
        const separator: HTMLSpanElement = document.createElement('span');
        separator.className = 'tool-separator';
        return separator;
    }

    public createBtn(props: IViewBtnProp): HTMLSpanElement {
        const btn: HTMLSpanElement = new ViewToolBtn().btn(props);
        return btn;
    }

    public createChartWidget(): HTMLDivElement {
        const container: HTMLDivElement = document.createElement('div');
        container.className = 'widget';
        const checkboxContainer: HTMLLabelElement = document.createElement('label');
        checkboxContainer.className = 'checkbox-container';
        checkboxContainer.innerText = 'suggestion';
        const suggestBox: HTMLInputElement = document.createElement('input');
        suggestBox.id = 'suggestBox';
        suggestBox.type = 'checkbox';
        suggestBox.checked = true;
        checkboxContainer.appendChild(suggestBox);
        const checkMark: HTMLSpanElement = document.createElement('span');
        checkMark.className = 'checkmark';
        checkboxContainer.appendChild(checkMark);
        container.appendChild(checkboxContainer);
        return container;
    }

    public createPlayerWidget(): HTMLDivElement {
        const container: HTMLDivElement = document.createElement('div');
        container.className = 'widget';
        container.appendChild(player.widget);
        return container;
    }
}

interface IBoundary {
    x1: number
    y1: number
    x2: number
    y2: number
}

class ViewToolBtn {
    //static vars
    static SINGLE: string = 'single';
    static LASSO: string = 'lasso';
    static DATA: string = 'data';
    static REVERT: string = 'revert';
    static REDO: string = 'redo';
    static ZOOM: string = 'zoom';
    static ZOOM_OUT: string = 'zoomOut';
    static ZOOM_IN: string = 'zoomIn';

    public btn(props: IViewBtnProp): HTMLSpanElement {
        const btn: HTMLSpanElement = document.createElement('span');
        btn.className = 'tool-btn';
        if (props.title) {
            btn.title = props.title;
        }

        switch (props.clickEvtType) {
            case ViewToolBtn.SINGLE:
                btn.onclick = () => this.singleSelect();
                break;
            case ViewToolBtn.LASSO:
                btn.onclick = () => this.lassoSelect();
                break;
            case ViewToolBtn.DATA:
                btn.onclick = () => this.dataSelect();
                break;
            case ViewToolBtn.REVERT:
                btn.onclick = () => this.revert();
                break;
            case ViewToolBtn.REDO:
                btn.onclick = () => this.redo();
                break;
            case ViewToolBtn.ZOOM:
                btn.setAttribute('disabled', 'true');
                break;
            case ViewToolBtn.ZOOM_IN:
                btn.classList.add('narrow-tool-btn');
                btn.onclick = () => this.zoomIn();
                break;
            case ViewToolBtn.ZOOM_OUT:
                btn.classList.add('narrow-tool-btn');
                btn.onclick = () => this.zoomOut();
                break;
        }

        const btnIcon: HTMLSpanElement = document.createElement('span');
        btnIcon.className = 'svg-icon ' + props.iconClass;
        btn.appendChild(btnIcon);
        return btn;
    }

    // btn listeners
    public singleSelect(): void {
        const that: ViewToolBtn = this;
        console.log('toggle single selection!');
        console.log(document.getElementById('chartContainer').classList.contains('single-select'));
        if (!document.getElementById('chartContainer').classList.contains('single-select')) {
            lassoSelector.removeContainer();
            //change cursor
            document.getElementById('chartContainer').classList.add('single-select');
            document.getElementById('chartContainer').classList.remove('lasso-select');
            //change button status
            if (document.getElementsByClassName('selected-tool').length > 0) {
                document.getElementsByClassName('selected-tool')[0].classList.remove('selected-tool');
            }
            document.getElementsByClassName('arrow-icon')[0].classList.add('selected-tool');
            //bind mouse listeners
            document.getElementById('chartContainer').onmousedown = (downEvt) => {
                const evtTarget: HTMLElement = <HTMLElement>downEvt.target;
                if (evtTarget.id === 'selectionFrame' || (evtTarget.classList.contains('mark') && !state.selection.includes(evtTarget.id))) {//clicked within the selection frame

                } else {//doing selection
                    const svg: HTMLElement = document.getElementById('visChart');
                    if (svg) {
                        const svgBBox = svg.getBoundingClientRect();
                        const rectPosi1X = downEvt.pageX - svgBBox.x, rectPosi1Y = downEvt.pageY - svgBBox.y;
                        let lastMouseX = downEvt.pageX, lastMouseY = downEvt.pageY;
                        let isDragging = true;
                        //create the selection frame
                        const selectionFrame: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        selectionFrame.setAttributeNS(null, 'id', 'rectSelectFrame');
                        selectionFrame.setAttributeNS(null, 'x', rectPosi1X.toString());
                        selectionFrame.setAttributeNS(null, 'y', rectPosi1Y.toString());
                        svg.appendChild(selectionFrame);
                        document.onmousemove = (moveEvt) => {
                            if (isDragging) {
                                const rectPosi2X = moveEvt.pageX - svgBBox.x, rectPosi2Y = moveEvt.pageY - svgBBox.y;
                                const possibleMarks: string[] = that.judgeSelected({
                                    x1: rectPosi1X,
                                    y1: rectPosi1Y,
                                    x2: rectPosi2X,
                                    y2: rectPosi2Y
                                }, state.selection, 'visChart');

                                //can't move outside the view
                                if (rectPosi2X >= 0 && rectPosi2X <= document.getElementById('chartContainer').offsetWidth && rectPosi2Y >= 0 && rectPosi2Y <= document.getElementById('chartContainer').offsetHeight) {
                                    let tmpX = rectPosi2X < rectPosi1X ? rectPosi2X : rectPosi1X;
                                    let tmpY = rectPosi2Y < rectPosi1Y ? rectPosi2Y : rectPosi1Y;
                                    let tmpWidth = Math.abs(rectPosi1X - rectPosi2X);
                                    let tmpHeight = Math.abs(rectPosi1Y - rectPosi2Y);

                                    /* update the selection frame */
                                    selectionFrame.setAttributeNS(null, 'x', tmpX.toString());
                                    selectionFrame.setAttributeNS(null, 'y', tmpY.toString());
                                    selectionFrame.setAttributeNS(null, 'width', tmpWidth.toString());
                                    selectionFrame.setAttributeNS(null, 'height', tmpHeight.toString());
                                }
                            }
                        }
                        document.onmouseup = (upEvt) => {
                            isDragging = false;
                            const mouseMoveThsh: number = 3;//mouse move less than 3px -> single selection; bigger than 3px -> rect selection
                            if (Tool.pointDist(lastMouseX, upEvt.pageX, lastMouseY, upEvt.pageY) > mouseMoveThsh) {//doing rect selection
                                const rectPosi2X = upEvt.pageX - svgBBox.x, rectPosi2Y = upEvt.pageY - svgBBox.y;
                                const selectedMarks: string[] = that.judgeSelected({
                                    x1: rectPosi1X,
                                    y1: rectPosi1Y,
                                    x2: rectPosi2X,
                                    y2: rectPosi2Y
                                }, state.selection, 'visChart');
                                state.selection = selectedMarks;
                            }else{//single selection

                            }
                            selectionFrame.remove();
                            
                        }
                    }
                }
            }
        }
    }

    /**
     * judge which marks are selected in the given area
     * @param boundary 
     * @param framedMarks
     * @param svgId 
     */
    public judgeSelected(boundary: IBoundary, framedMarks: string[], svgId: string): string[] {
        let result: string[] = [];
        const [minX, maxX] = boundary.x1 < boundary.x2 ? [boundary.x1, boundary.x2] : [boundary.x2, boundary.x1];
        const [minY, maxY] = boundary.y1 < boundary.y2 ? [boundary.y1, boundary.y2] : [boundary.y2, boundary.y1];

        //filter marks
        Array.prototype.forEach.call(document.getElementsByClassName('mark'), (m: HTMLElement) => {
            const markBBox = m.getBoundingClientRect();
            const bBoxX1 = markBBox.left - document.getElementById(svgId).getBoundingClientRect().x,
                bBoxY1 = markBBox.top - document.getElementById(svgId).getBoundingClientRect().y,
                bBoxX2 = bBoxX1 + markBBox.width,
                bBoxY2 = bBoxY1 + markBBox.height;
            let framed = false;
            if (bBoxX1 >= minX && bBoxX2 <= maxX && bBoxY1 >= minY && bBoxY2 <= maxY) {
                result.push(m.id);
                framed = true;
            }
            //update the appearance of marks
            if ((framedMarks.includes(m.id) && framed) || (!framedMarks.includes(m.id) && !framed)) {
                m.classList.add('non-framed-mark');
            } else if ((framedMarks.includes(m.id) && !framed) || (!framedMarks.includes(m.id) && framed)) {
                m.classList.remove('non-framed-mark');
            }
        })

        return result;
    }

    public lassoSelect(): void {
        console.log('toggle lasso selection!');
        if (!document.getElementById('chartContainer').classList.contains('lasso-select')) {
            //change cursor
            document.getElementById('chartContainer').classList.remove('single-select');
            document.getElementById('chartContainer').classList.add('lasso-select');
            //change button status
            if (document.getElementsByClassName('selected-tool').length > 0) {
                document.getElementsByClassName('selected-tool')[0].classList.remove('selected-tool');
            }
            document.getElementsByClassName('lasso-icon')[0].classList.add('selected-tool');
            //create the lasso container
            if (document.getElementById('visChart')) {//there is a chart in chart view
                const tmpChart: HTMLElement = document.getElementById('visChart');
                lassoSelector.createContainer(tmpChart.clientWidth, tmpChart.clientHeight);
                lassoSelector.createSelector();
            }
        }
    }

    public dataSelect(): void {
        console.log('toggle data selection!');
    }

    public zoomIn(): void {
        console.log('zoom in!');
    }

    public zoomOut(): void {
        console.log('zoom in!');
    }

    public revert(): void {
        console.log('step backward');
    }

    public redo(): void {
        console.log('step forward');
    }

}