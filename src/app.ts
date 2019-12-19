import './assets/style/app.scss'
import Nav from './components/nav'
import ResizablePanel, { IRPanel } from './components/resizablePanel'
import ViewWindow from './components/viewWindow'

function app() {
    const outerWrapper = document.createElement('div');
    outerWrapper.className = 'outer-wrapper';
    outerWrapper.appendChild(Nav.createNav());

    const innerWrapper = document.createElement('div');
    innerWrapper.className = 'inner-wrapper';
    const rPanels: IRPanel = ResizablePanel.createRPanels(7, 3);//chart & video, keyframe
    const chartVideoPanels: IRPanel = ResizablePanel.createRPanels(5, 5, false);

    //create chart view
    const chartView: HTMLDivElement = ViewWindow.createView(ViewWindow.CHART_VIEW_TITLE);

    
    chartVideoPanels.panel1.appendChild(chartView);

    rPanels.panel1.appendChild(chartVideoPanels.wrapper);

    innerWrapper.appendChild(rPanels.wrapper);
    outerWrapper.appendChild(innerWrapper);

    return outerWrapper;
}

document.body.appendChild(app());