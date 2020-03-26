import './assets/style/app.scss'
import Nav from './components/nav'
import ResizablePanel, { IRPanel } from './components/resizablePanel'
import ViewWindow from './components/viewWindow'
import FloatingWindow from './components/floatingWindow'
import { state } from './app/state'
import Tool from './util/tool'

function app(): HTMLDivElement {
    const outerWrapper: HTMLDivElement = document.createElement('div');
    outerWrapper.id = 'appWrapper';
    outerWrapper.className = 'outer-wrapper';
    const nav = new Nav();
    nav.createNav();
    outerWrapper.appendChild(nav.navContainer);

    const innerWrapper: IRPanel = ResizablePanel.createRPanels(false, { verticle: false });
    innerWrapper.wrapper.classList.add('inner-wrapper');
    //create data panel
    const dataView: ViewWindow = new ViewWindow(ViewWindow.DATA_VIEW_TITLE);
    dataView.createView();
    innerWrapper.panel1.appendChild(dataView.view);

    //create main panels
    const mainWrapper: IRPanel = ResizablePanel.createRPanels(true, { p1: 6, p2: 4, verticle: true });//chart & video, keyframe
    const chartVideoPanels: IRPanel = ResizablePanel.createRPanels(true, { p1: 5, p2: 5, verticle: false });
    //create chart view
    const chartView: ViewWindow = new ViewWindow(ViewWindow.CHART_VIEW_TITLE);
    chartView.createView();
    chartVideoPanels.panel1.appendChild(chartView.view);
    //create video view
    const videoView: ViewWindow = new ViewWindow(ViewWindow.VIDEO_VIEW_TITLE);
    videoView.createView();
    chartVideoPanels.panel2.appendChild(videoView.view);
    mainWrapper.panel1.appendChild(chartVideoPanels.wrapper);

    //create keyframe view
    const kfView: ViewWindow = new ViewWindow(ViewWindow.KF_VIEW_TITLE);
    kfView.createView();
    mainWrapper.panel2.appendChild(kfView.view);

    innerWrapper.panel2.appendChild(mainWrapper.wrapper);
    outerWrapper.appendChild(innerWrapper.wrapper);

    // const footer: HTMLDivElement = document.createElement('div');
    // footer.id = 'footer';
    // footer.className = 'footer';
    // outerWrapper.appendChild(footer);
    return outerWrapper;
}


document.body.appendChild(app());
//init styles
Tool.resizeWidgets();
state.reset();
//load examples
// (<HTMLElement>document.getElementsByClassName('open-eg-icon')[0]).click();
//thisis to test timeline
// Timeline.renderTimeline(<SVGSVGElement><unknown>document.getElementById('timelineSvg'));

window.onresize = () => {
    Tool.resizeWidgets();
}