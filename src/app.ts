import './assets/style/app.scss'
import Nav from './components/nav'
import ResizablePanel from './components/resizablePanel'

function app() {
    const outerWrapper = document.createElement('div');
    outerWrapper.className = 'outer-wrapper';
    outerWrapper.appendChild(Nav.createNav());

    const innerWrapper = document.createElement('div');
    innerWrapper.className = 'inner-wrapper';
    let rPanels = ResizablePanel.createRPanels(7, 3);

    rPanels.panel1.appendChild(ResizablePanel.createRPanels(5, 5, false).wrapper);

    innerWrapper.appendChild(rPanels.wrapper);
    outerWrapper.appendChild(innerWrapper);

    return outerWrapper;
}

document.body.appendChild(app());