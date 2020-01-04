import './assets/style/app.scss'
import Nav from './components/nav'
import ResizablePanel, { IRPanel } from './components/resizablePanel'
import ViewWindow from './components/viewWindow'
import FloatingWindow from './components/floatingWindow'
import {state} from './app/state'

function app(): HTMLDivElement {
    const outerWrapper: HTMLDivElement = document.createElement('div');
    outerWrapper.id = 'appWrapper';
    outerWrapper.className = 'outer-wrapper';
    const nav = new Nav();
    nav.createNav();
    outerWrapper.appendChild(nav.navContainer);

    const innerWrapper: HTMLDivElement = document.createElement('div');
    innerWrapper.className = 'inner-wrapper';
    const rPanels: IRPanel = ResizablePanel.createRPanels(6, 4);//chart & video, keyframe
    const chartVideoPanels: IRPanel = ResizablePanel.createRPanels(5, 5, false);

    //create chart view
    const chartView: ViewWindow = new ViewWindow(ViewWindow.CHART_VIEW_TITLE);
    chartView.createView();
    chartVideoPanels.panel1.appendChild(chartView.view);
    //create video view
    const videoView: ViewWindow = new ViewWindow(ViewWindow.VIDEO_VIEW_TITLE);
    videoView.createView();
    chartVideoPanels.panel2.appendChild(videoView.view);
    rPanels.panel1.appendChild(chartVideoPanels.wrapper);

    //create keyframe view
    const kfView: ViewWindow = new ViewWindow(ViewWindow.KF_VIEW_TITLE);
    kfView.createView();
    rPanels.panel2.appendChild(kfView.view);

    innerWrapper.appendChild(rPanels.wrapper);
    outerWrapper.appendChild(innerWrapper);

    // const floatingWindow: FloatingWindow = new FloatingWindow();
    // floatingWindow.createFloatingWindow(FloatingWindow.TYPE_EXAMPLE);
    // outerWrapper.appendChild(floatingWindow.floatingWindow);
    return outerWrapper;
}


document.body.appendChild(app());
// const promise = new Promise<string>((resolve, reject) => {
//     // document.body.appendChild(app());
//     // resolve();
// })


(function () {
    //init buttons and stuff
    // (<HTMLElement>document.getElementsByClassName('arrow-icon')[0]).click();
    state.reset();
})()