import '../assets/style/floating-window.scss'
import MushroomImg from '../assets/img/examples/mushroom.png'
import MushroomChart from '../assets/charts/mushrooms.svg'
import GanttImg from '../assets/img/examples/gantt.png'
import GanttChart from '../assets/charts/gantt.svg'
import Reducer from '../app/reducer'
import * as action from '../app/action'
import { canisGenerator } from '../app/canisGenerator'
import { State, state } from '../app/state'

/**for test!!!!!!!!!!!!!!!!!!!!!!!! */
import Renderer from '../app/renderer';//for test!!!!!
import mushroomSpec from '../assets/tmp/mushroomSpec.json'
/**end for test!!!!!!!!!!!!!!!!!!!!!!!! */

export default class FloatingWindow {
    static TYPE_EXAMPLE: string = 'exampleContainer';//type of the floating window is example
    static TYPE_SPEC: string = 'SpecContainer';//type of the floating window is spec test

    static MUSHROOM_CHART: string = 'mushroom';
    static GANTT_CHART: string = 'gantt';

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
                titleContent.innerHTML = 'examples';
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
        const projectTitle: HTMLHeadingElement = document.createElement('h5');
        projectTitle.innerText = 'projects';
        exampleList.appendChild(projectTitle);
        const chartTitle: HTMLHeadingElement = document.createElement('h5');
        chartTitle.innerText = 'charts';
        exampleList.appendChild(chartTitle);
        //add chart examples
        exampleList.appendChild(this.createExampleItem(FloatingWindow.MUSHROOM_CHART, 'Mushroom'));
        exampleList.appendChild(this.createExampleItem(FloatingWindow.GANTT_CHART, 'Gantt'));
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
                item.onclick = () => {
                    //save histroy before update state
                    State.tmpStateBusket = [];
                    State.tmpStateBusket.push([action.LOAD_CHARTS, state.charts]);
                    Reducer.triger(action.LOAD_CHARTS, [MushroomChart]);
                    this.floatingWindow.remove();
                }
                break;
            case FloatingWindow.GANTT_CHART:
                img.src = GanttImg;
                item.onclick = () => {
                    //save histroy before update state
                    State.tmpStateBusket = [];
                    State.tmpStateBusket.push([action.LOAD_CHARTS, state.charts]);
                    Reducer.triger(action.LOAD_CHARTS, [GanttChart]);
                    console.log('gantt chart: ', GanttChart);
                    this.floatingWindow.remove();
                }
                break;
        }
        imgWrapper.appendChild(img);
        item.appendChild(imgWrapper);
        const captionWrapper: HTMLParagraphElement = document.createElement('p');
        captionWrapper.innerText = caption;
        item.appendChild(captionWrapper);
        return item;
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
        const mushroomSpecBtn: HTMLButtonElement = document.createElement('button');
        mushroomSpecBtn.innerHTML = 'mushroomspec';
        mushroomSpecBtn.onclick = () => {
            specPanel.innerHTML = JSON.stringify(mushroomSpec, null, 2);
        }
        specWrapper.appendChild(mushroomSpecBtn);
        wrapper.appendChild(specWrapper);
        const specPanel: HTMLTextAreaElement = document.createElement('textarea');
        specPanel.style.width = '100%';
        specPanel.style.height = '400px';
        specPanel.id = 'specPanel';
        specPanel.innerHTML = JSON.stringify(canisGenerator.canisSpec.animations, null, 2);
        wrapper.appendChild(specPanel);
        const renderBtn: HTMLButtonElement = document.createElement('button');
        renderBtn.innerHTML = 'render spec';
        renderBtn.onclick = () => {
            let tmpSpec = JSON.parse(specPanel.value);
            canisGenerator.canisSpec.animations = tmpSpec;
            Renderer.renderSpec();
        }
        wrapper.appendChild(renderBtn);
        return wrapper;
    }
}