import '../assets/style/view-window.scss'
import { ChartViewContent, VideoViewContent, KFViewContent } from './viewContent'
import Tool from '../util/tool'

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
        toolContainer.appendChild(this.createBtn('Selection', this.singleSelect, 'arrow-icon', true));
        toolContainer.appendChild(this.createBtn('Lasso Selection', this.lassoSelect, 'lasso-icon'));
        toolContainer.appendChild(this.createSeparator());
        toolContainer.appendChild(this.createBtn('Select from Data', this.dataSelect, 'table-icon'));
        toolContainer.appendChild(this.createSeparator());
        return toolContainer;
    }

    public static createSeparator(): HTMLSpanElement {
        const separator: HTMLSpanElement = document.createElement('span');
        separator.className = 'tool-separator';
        return separator;
    }

    public static createBtn(title: string, clickEvt: () => void, iconClass: string, selected: boolean = false): HTMLSpanElement {
        const btn: HTMLSpanElement = document.createElement('span');
        btn.className = 'tool-btn';
        btn.title = title;
        btn.onclick = clickEvt;
        const btnIcon: HTMLSpanElement = document.createElement('span');
        btnIcon.className = ['svg-icon', iconClass, selected ? 'selected-tool' : ''].join(' ');
        btn.appendChild(btnIcon);
        return btn;
    }

    public static singleSelect(): void {
        console.log('toggle single selection!');
    }

    public static lassoSelect(): void {
        console.log('toggle lasso selection!');
    }

    public static dataSelect(): void {
        console.log('toggle data selection!');
    }
}