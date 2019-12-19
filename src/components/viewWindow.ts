import '../assets/style/view-window.scss'
import { ChartViewContent, VideoViewContent, KFViewContent } from './viewContent'
import Tool from '../util/tool'

interface IViewBtnProp {
    title: string,
    clickEvtType: string,
    iconClass: string,
    selected?: boolean
}

export default class ViewWindow {
    static CHART_VIEW_TITLE: string = 'chart';
    static VIDEO_VIEW_TITLE: string = 'animation';
    static KF_VIEW_TITLE: string = 'keyframes';

    public static createView(title: string) {
        const view: HTMLDivElement = document.createElement('div');
        view.className = 'view';

        const viewTitleContainer: HTMLDivElement = document.createElement('div');
        viewTitleContainer.className = 'view-title-container';
        const viewTitleText: HTMLSpanElement = document.createElement('span');
        viewTitleText.className = 'view-title-text';
        viewTitleText.innerHTML = Tool.firstLetterUppercase(title);
        viewTitleContainer.appendChild(viewTitleText);
        view.appendChild(viewTitleContainer);

        switch (title) {
            case this.CHART_VIEW_TITLE:
                viewTitleContainer.appendChild(this.createSelectionTools());
                view.appendChild(ChartViewContent.createChartViewContent());
                break;
            case this.VIDEO_VIEW_TITLE:
                view.appendChild(VideoViewContent.createVideoViewContent());
                break;
            case this.KF_VIEW_TITLE:
                view.appendChild(KFViewContent.createKeyframeViewContent());
                break;
        }
        return view;
    }

    public static createSelectionTools(): HTMLDivElement {
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

    public static createSeparator(): HTMLSpanElement {
        const separator: HTMLSpanElement = document.createElement('span');
        separator.className = 'tool-separator';
        return separator;
    }

    public static createBtn(props: IViewBtnProp): HTMLSpanElement {
        const btn: HTMLSpanElement = new ViewToolBtn().btn(props);
        return btn;
    }
}

class ViewToolBtn {
    //static vars
    static SINGLE: string = 'single';
    static LASSO: string = 'lasso';
    static DATA: string = 'data';

    btn(props: IViewBtnProp): HTMLSpanElement {
        const btn: HTMLSpanElement = document.createElement('span');
        btn.className = 'tool-btn';
        btn.title = props.title;

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
        }

        const btnIcon: HTMLSpanElement = document.createElement('span');
        btnIcon.className = ['svg-icon', props.iconClass, props.selected ? 'selected-tool' : ''].join(' ');
        btn.appendChild(btnIcon);
        return btn;
    }

    /******* btn listeners ********/
    singleSelect(): void {
        console.log('toggle single selection!');
    }

    lassoSelect(): void {
        console.log('toggle lasso selection!');
    }

    dataSelect(): void {
        console.log('toggle data selection!');
    }
}