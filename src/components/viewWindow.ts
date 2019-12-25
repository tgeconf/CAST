import '../assets/style/view-window.scss'
import ViewContent from './viewContent'
import Slider from './slider'
import Tool from '../util/tool'

interface IViewBtnProp {
    title?: string,
    clickEvtType: string,
    iconClass: string,
    selected?: boolean
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
            iconClass: 'arrow-icon',
            selected: true
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
        const slider: Slider = new Slider(Slider.SLIDER_LONG, [0, 100]);
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

    btn(props: IViewBtnProp): HTMLSpanElement {
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
        btnIcon.className = ['svg-icon', props.iconClass, props.selected ? 'selected-tool' : ''].join(' ');
        btn.appendChild(btnIcon);
        return btn;
    }

    // btn listeners
    singleSelect(): void {
        console.log('toggle single selection!');
    }

    lassoSelect(): void {
        console.log('toggle lasso selection!');
    }

    dataSelect(): void {
        console.log('toggle data selection!');
    }

    zoomIn(): void{
        console.log('zoom in!');
    }

    zoomOut(): void {
        console.log('zoom in!');
    }

    revert():void {
        console.log('step backward');
    }

    redo(): void {
        console.log('step forward');
    }
}