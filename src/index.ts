import './assets/style/style.scss'
import LogoImg from './assets/img/logo.png'
// import _ from 'lodash'

import printMe from './print'

function component() {
    const ele = document.createElement('div');
    // ele.innerHTML = _.join(['Hello', 'webpack', ' ']);

    const logo = new Image();
    logo.src = LogoImg;
    ele.appendChild(logo);

    const btn = document.createElement('button');
    btn.innerHTML = 'print';
    btn.onclick = printMe;
    ele.appendChild(btn);

    return ele;
}

document.body.appendChild(component());