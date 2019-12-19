import './assets/style/app.scss'
import Nav from './components/nav'
import ResizablePanel, { IRPanel } from './components/resizablePanel'
import ViewWindow from './components/viewWindow'

function app(): HTMLDivElement {
    const outerWrapper: HTMLDivElement = document.createElement('div');
    outerWrapper.className = 'outer-wrapper';
    outerWrapper.appendChild(Nav.createNav());

    const innerWrapper: HTMLDivElement = document.createElement('div');
    innerWrapper.className = 'inner-wrapper';
    const rPanels: IRPanel = ResizablePanel.createRPanels(7, 3);//chart & video, keyframe
    const chartVideoPanels: IRPanel = ResizablePanel.createRPanels(5, 5, false);

    //create chart view
    const chartView: HTMLDivElement = ViewWindow.createView(ViewWindow.CHART_VIEW_TITLE);
    chartVideoPanels.panel1.appendChild(chartView);
    const videoView: HTMLDivElement = ViewWindow.createView(ViewWindow.VIDEO_VIEW_TITLE);
    chartVideoPanels.panel2.appendChild(videoView);
    rPanels.panel1.appendChild(chartVideoPanels.wrapper);

    //create keyframe view
    const kfView: HTMLDivElement = ViewWindow.createView(ViewWindow.KF_VIEW_TITLE);
    rPanels.panel2.appendChild(kfView);

    innerWrapper.appendChild(rPanels.wrapper);
    outerWrapper.appendChild(innerWrapper);

    return outerWrapper;
}

document.body.appendChild(app());