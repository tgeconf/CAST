import './assets/style/app.scss'
import Nav from './components/nav'

function app() {
    const ele = document.createElement('div');
    ele.className = 'outer-wrapper';

    ele.appendChild(Nav.createNav());

    return ele;
}

document.body.appendChild(app());