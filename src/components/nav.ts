import '../assets/style/nav.scss'
import LogoImg from '../assets/img/logo.png'
import Separator from './nav-separator'
import NavBtn from './nav-btn'

export default class Nav {
    public static createNav() {
        const navContainer = document.createElement('div');
        navContainer.className = 'nav';

        //create logo contianer
        const logoContainer = document.createElement('span');
        logoContainer.className = 'logo-container';
        const logo = new Image();
        logo.src = LogoImg;
        logoContainer.appendChild(logo);
        const logoText = document.createElement('span');
        logoText.textContent = 'Canis';
        logoText.className = 'title';
        logoContainer.appendChild(logoText);
        navContainer.appendChild(logoContainer);

        navContainer.appendChild(Separator.createSeparator());

        //create buttons
        navContainer.appendChild(NavBtn.createNavFileBtn('createNew', 'new', 'new project', NavBtn.createNew));
        navContainer.appendChild(NavBtn.createNavBtn('open-eg', 'load example', NavBtn.loadExamples));
        navContainer.appendChild(NavBtn.createNavFileBtn('openProject', 'open', 'open project', NavBtn.openProject));
        navContainer.appendChild(NavBtn.createNavBtn('save', 'save project', NavBtn.saveProject));
        navContainer.appendChild(NavBtn.createNavBtn('export', 'export video', NavBtn.exportProject));
        navContainer.appendChild(Separator.createSeparator());
        navContainer.appendChild(NavBtn.createNavBtn('revert', 'revert', NavBtn.revert));
        navContainer.appendChild(NavBtn.createNavBtn('redo', 'redo', NavBtn.redo));
        navContainer.appendChild(Separator.createSeparator());


        return navContainer;
    }


}