import '../assets/style/floating-window.scss'
import MushroomImg from '../assets/img/examples/mushroom.png'
import MushroomChart from '../assets/charts/mushrooms.svg'
import GanttImg from '../assets/img/examples/gantt.png'
import GanttChart from '../assets/charts/gantt.svg'
import OsImg from '../assets/img/examples/os.png'
import OsChart from '../assets/charts/os.svg'
import PurchasesImg from '../assets/img/examples/purchases.png'
import PurchasesChart from '../assets/charts/purchases.svg'
import NightingaleImg from '../assets/img/examples/nightingale.png'
import NightingaleChart from '../assets/charts/nightingale.svg'
import Reducer from '../app/reducer'
import * as action from '../app/action'
import { State, state } from '../app/state'

/**for test!!!!!!!!!!!!!!!!!!!!!!!! */
import Renderer from '../app/renderer';//for test!!!!!
import mushroomSpec from '../assets/tmp/mushroomSpec.json'
import ganttSpec from '../assets/tmp/ganttSpec.json'
import osSpec from '../assets/tmp/osSpec.json'
import purchasesSpec from '../assets/tmp/purchasesSpec.json'
import nightingaleSpec from '../assets/tmp/nightingaleSpec.json'
import mushroomTest1 from '../assets/tmp/mushroomTest1.json'
import { ViewContent } from './viewWindow'
import { Loading } from './widgets/loading'
/**end for test!!!!!!!!!!!!!!!!!!!!!!!! */

export default class FloatingWindow {
    static TYPE_EXAMPLE: string = 'exampleContainer';//type of the floating window is example
    static TYPE_SPEC: string = 'SpecContainer';//type of the floating window is spec test

    static MUSHROOM_CHART: string = 'mushroom';
    static GANTT_CHART: string = 'gantt';
    static OS_CHART: string = 'mobileOS';
    static PURCHASE_CHART: string = 'purchases';
    static NIGHTINGALE_CHART: string = 'nightingale';

    floatingWindow: HTMLDivElement;

    public createFloatingWindow(id: string) {
        //create the background container
        this.floatingWindow = document.createElement('div');
        this.floatingWindow.id = id;
        this.floatingWindow.className = 'floating-bg';
        //create window
        const fWindow: HTMLDivElement = document.createElement('div');
        fWindow.className = 'f-window';
        const windowTitle: HTMLDivElement = document.createElement('div');
        windowTitle.className = 'title-wrapper';
        const titleContent: HTMLDivElement = document.createElement('div');
        titleContent.className = 'title-content';

        windowTitle.appendChild(titleContent);
        const closeBtn: HTMLSpanElement = document.createElement('span');
        closeBtn.className = 'title-btn';
        const closeIcon: HTMLSpanElement = document.createElement('span');
        closeIcon.className = 'btn-icon close-icon';
        closeBtn.appendChild(closeIcon);
        closeBtn.onclick = () => {
            this.floatingWindow.remove();
        }
        windowTitle.appendChild(closeBtn);
        fWindow.appendChild(windowTitle);
        //create window content
        const windowContent: HTMLDivElement = document.createElement('div');
        windowContent.className = 'content-wrapper';
        switch (id) {
            case FloatingWindow.TYPE_EXAMPLE:
                titleContent.innerHTML = '';
                windowContent.appendChild(this.createExampleList());
                break;
            case FloatingWindow.TYPE_SPEC:
                titleContent.innerHTML = 'spec';
                windowContent.appendChild(this.createSpecPanel());
                break;
            default:
                break;
        }

        fWindow.appendChild(windowContent);
        this.floatingWindow.appendChild(fWindow);
    }

    public createExampleList(): HTMLDivElement {
        const exampleList: HTMLDivElement = document.createElement('div');
        exampleList.className = 'example-list';
        const projectTitle: HTMLHeadingElement = document.createElement('h3');
        projectTitle.innerText = 'Open Local Project';
        exampleList.appendChild(projectTitle);
        const clickableArea: HTMLDivElement = document.createElement('div');
        clickableArea.className = 'click-to-open-area';
        clickableArea.innerHTML = 'Drop Your Project File Here (or Click)';
        const uploadIcon: HTMLDivElement = document.createElement('div');
        uploadIcon.className = 'upload-icon';
        clickableArea.appendChild(uploadIcon);
        exampleList.appendChild(clickableArea);
        clickableArea.ondragover = (overEvt) => {
            overEvt.preventDefault();
        }
        clickableArea.ondragenter = () => {
            clickableArea.classList.add('drag-over-area');
        }
        clickableArea.ondragleave = () => {
            clickableArea.classList.remove('drag-over-area');
        }
        clickableArea.ondrop = (dropEvt) => {
            const that = this;
            dropEvt.preventDefault();
            let projectFile = dropEvt.dataTransfer.files[0];
            var fr = new FileReader();
            fr.readAsText(projectFile);
            fr.onload = function () {
                const spec: string = <string>fr.result;
                Reducer.triger(action.LOAD_CANIS_SPEC, JSON.parse(spec).spec);
                that.floatingWindow.remove();
            }
        }

        const chartTitle: HTMLHeadingElement = document.createElement('h3');
        chartTitle.innerText = 'Load Example Projects';
        exampleList.appendChild(chartTitle);
        //add chart examples
        const exampleItemContainer1: HTMLDivElement = document.createElement('div');
        exampleItemContainer1.className = 'list-item-container';
        exampleItemContainer1.appendChild(this.createExampleItem(FloatingWindow.MUSHROOM_CHART, 'Mushroom'));
        exampleItemContainer1.appendChild(this.createExampleItem(FloatingWindow.GANTT_CHART, 'Gantt'));
        exampleItemContainer1.appendChild(this.createExampleItem(FloatingWindow.OS_CHART, 'Mobile OS'));
        exampleItemContainer1.appendChild(this.createExampleItem(FloatingWindow.PURCHASE_CHART, 'Doughnut Purchases'));
        exampleList.appendChild(exampleItemContainer1);
        const exampleItemContainer2: HTMLDivElement = document.createElement('div');
        exampleItemContainer2.className = 'list-item-container';
        exampleItemContainer2.appendChild(this.createExampleItem(FloatingWindow.NIGHTINGALE_CHART, 'Nightingale'));
        exampleList.appendChild(exampleItemContainer2);
        return exampleList;
    }

    public createExampleItem(name: string, caption: string): HTMLDivElement {
        const item: HTMLDivElement = document.createElement('div');
        item.className = 'example-list-item';
        const imgWrapper: HTMLDivElement = document.createElement('div');
        const img: HTMLImageElement = document.createElement('img');
        switch (name) {
            case FloatingWindow.MUSHROOM_CHART:
                img.src = MushroomImg;
                item.onclick = () => this.loadExampleChart(MushroomChart);
                break;
            case FloatingWindow.GANTT_CHART:
                img.src = GanttImg;
                item.onclick = () => this.loadExampleChart(GanttChart);
                break;
            case FloatingWindow.OS_CHART:
                img.src = OsImg;
                item.onclick = () => this.loadExampleChart(OsChart);
                break;
            case FloatingWindow.PURCHASE_CHART:
                img.src = PurchasesImg;
                item.onclick = () => this.loadExampleChart(PurchasesChart);
                break;
            case FloatingWindow.NIGHTINGALE_CHART:
                img.src = NightingaleImg;
                item.onclick = () => this.loadExampleChart(NightingaleChart);
                break;
        }
        imgWrapper.appendChild(img);
        item.appendChild(imgWrapper);
        const captionWrapper: HTMLParagraphElement = document.createElement('p');
        captionWrapper.innerText = caption;
        item.appendChild(captionWrapper);
        return item;
    }

    public loadExampleChart(chart: any) {
        //triger loading
        Reducer.triger(action.UPDATE_LOADING_STATUS, { il: true, srcDom: document.getElementById(ViewContent.VIDEO_VIEW_CONTENT_ID), content: Loading.LOADING });
        setTimeout(() => {
            //reset state history
            State.stateHistoryIdx = -1;
            State.stateHistory = [];
            State.tmpStateBusket = [];
            State.tmpStateBusket.push({
                historyAction: {actionType: action.LOAD_CHARTS, actionVal: state.charts},
                currentAction: {actionType: action.LOAD_CHARTS, actionVal: [chart]}
            })
            State.saveHistory();
            Reducer.triger(action.LOAD_CHARTS, [chart]);
            this.floatingWindow.remove();
        }, 1);
    }

    /**
     * to test keyframes since there is no timeline view yet
     */
    public createSpecPanel(): HTMLDivElement {
        const wrapper: HTMLDivElement = document.createElement('div');
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        const specWrapper: HTMLDivElement = document.createElement('div');
        specWrapper.style.width = '100%';
        specWrapper.style.height = '30px';
        specWrapper.appendChild(this.createTestSpecBtn('mushroomSpec', mushroomSpec));
        specWrapper.appendChild(this.createTestSpecBtn('mushroomTest1', mushroomTest1));
        specWrapper.appendChild(this.createTestSpecBtn('ganttSpec', ganttSpec));
        specWrapper.appendChild(this.createTestSpecBtn('osSpec', osSpec));
        specWrapper.appendChild(this.createTestSpecBtn('purchasesSpec', purchasesSpec));
        specWrapper.appendChild(this.createTestSpecBtn('nightingaleSpec', nightingaleSpec));
        wrapper.appendChild(specWrapper);
        const specPanel: HTMLTextAreaElement = document.createElement('textarea');
        specPanel.style.width = '100%';
        specPanel.style.height = '400px';
        specPanel.id = 'specPanel';
        specPanel.innerHTML = JSON.stringify(state.spec.animations, null, 2);
        wrapper.appendChild(specPanel);
        const renderBtn: HTMLButtonElement = document.createElement('button');
        renderBtn.innerHTML = 'render spec';
        renderBtn.onclick = () => {
            let tmpSpec = JSON.parse(specPanel.value);
            Reducer.triger(action.UPDATE_SPEC_ANIMATIONS, tmpSpec);
            this.floatingWindow.remove();
        }
        wrapper.appendChild(renderBtn);
        return wrapper;
    }
    public createTestSpecBtn(text: string, spec: any) {
        const mushroomSpecBtn: HTMLButtonElement = document.createElement('button');
        mushroomSpecBtn.innerHTML = text;
        mushroomSpecBtn.onclick = () => {
            document.getElementById('specPanel').innerHTML = JSON.stringify(spec, null, 2);
        }
        return mushroomSpecBtn;
    }
}