import '../assets/style/floating-window.scss'
import MushroomImg from '../assets/img/examples/mushroom.png'
import MushroomChart from '../assets/charts/mushrooms.svg'
import Reducer from '../app/reducer'
import * as action from '../app/action'

export default class FloatingWindow {
    static TYPE_EXAMPLE: string = 'exampleContainer';//type of the floating window is example
    static MUSHROOM_CHART: string = 'mushroom';

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
        titleContent.innerHTML = 'examples'
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
                windowContent.appendChild(this.createExampleList());
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
                    console.log(typeof MushroomChart);
                    Reducer.triger(action.LOAD_CHARTS, [MushroomChart]);
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
}