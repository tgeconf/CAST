import '../assets/style/nav.scss'
import LogoImg from '../assets/img/logo.png'
import Separator from './navSeparator'
import NavBtn from './navBtn'

export default class Nav {
    public static createNav() {
        const navContainer: HTMLDivElement = document.createElement('div');
        navContainer.className = 'nav';

        //create logo contianer
        const logoContainer: HTMLSpanElement = document.createElement('span');
        logoContainer.className = 'logo-container';
        const logo: HTMLImageElement = new Image();
        logo.src = LogoImg;
        logoContainer.appendChild(logo);
        const logoText: HTMLSpanElement = document.createElement('span');
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