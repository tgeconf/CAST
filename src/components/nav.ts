import '../assets/style/nav.scss'
import LogoImg from '../assets/img/logo.png'
// import NavBtn from './navBtn'
import Tool from '../util/tool'

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

        navContainer.appendChild(this.createSeparator());

        //create buttons
        navContainer.appendChild(new NavBtn().createNavFileBtn({
            inputId: 'createNew', 
            classNameStr: 'new', 
            title: 'new project', 
            evtType: NavBtn.CREATE_NEW
        }));
        navContainer.appendChild(new NavBtn().createNavBtn({
            classNameStr: 'open-eg',
            title: 'load example',
            evtType: NavBtn.LOAD_EXAMPLES
        }));
        navContainer.appendChild(new NavBtn().createNavFileBtn({
            inputId: 'openProject',
            classNameStr: 'open',
            title: 'open project',
            evtType: NavBtn.OPEN_PROJECT
        }));
        navContainer.appendChild(new NavBtn().createNavBtn({
            classNameStr: 'save',
            title: 'save project',
            evtType: NavBtn.SAVE_PROJECT
        }));
        navContainer.appendChild(new NavBtn().createNavBtn({
            classNameStr: 'export',
            title: 'export video',
            evtType: NavBtn.EXPORT_PROJECT
        }));
        navContainer.appendChild(this.createSeparator());
        navContainer.appendChild(new NavBtn().createNavBtn({
            classNameStr: 'revert',
            title: 'revert',
            evtType: NavBtn.REVERT
        }));
        navContainer.appendChild(new NavBtn().createNavBtn({
            classNameStr: 'redo',
            title: 'redo',
            evtType: NavBtn.REDO
        }));
        navContainer.appendChild(this.createSeparator());

        return navContainer;
    }

    public static createSeparator() {
        const sep: HTMLSpanElement = document.createElement('span');
        sep.className = 'separator';
        return sep;
    }
}

interface INavBtnProps {
    inputId?: string,
    classNameStr: string,
    title: string,
    evtType: string
}

class NavBtn {
    static CREATE_NEW: string = 'createNew';
    static OPEN_PROJECT: string = 'openProject';
    static SAVE_PROJECT: string = 'saveProject';
    static LOAD_EXAMPLES: string = 'loadExamples';
    static EXPORT_PROJECT: string = 'exportProject';
    static REVERT: string = 'revert';
    static REDO: string = 'redo';

    createNavBtn(props: INavBtnProps): HTMLSpanElement {
        const btn: HTMLSpanElement = document.createElement('span');
        btn.className = 'nav-btn';
        btn.setAttribute('title', Tool.firstLetterUppercase(props.title));
        switch (props.evtType) {
            case NavBtn.LOAD_EXAMPLES:
                btn.onclick = () => this.loadExamples();
                break;
            case NavBtn.EXPORT_PROJECT:
                btn.onclick = () => this.exportProject();
                break;
            case NavBtn.REVERT:
                btn.onclick = () => this.revert();
                break;
            case NavBtn.REDO:
                btn.onclick = () => this.redo();
                break;
        }

        const icon: HTMLElement = document.createElement('span');
        icon.className = props.classNameStr + '-icon';
        btn.appendChild(icon);

        return btn;
    }

    createNavFileBtn(props: INavBtnProps) {
        const btn: HTMLSpanElement = document.createElement('span');
        btn.className = 'nav-btn';
        btn.setAttribute('title', Tool.firstLetterUppercase(props.title));
        btn.onclick = () => {
            document.getElementById(props.inputId).click();
        }

        const input: HTMLInputElement = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.id = props.inputId;
        input.style.display = 'none';
        switch (props.evtType) {
            case NavBtn.CREATE_NEW:
                input.onchange = () => this.createNew();
                break;
            case NavBtn.OPEN_PROJECT:
                input.onchange = () => this.openProject();
                break;
        }
        btn.appendChild(input);

        const icon: HTMLSpanElement = document.createElement('span');
        icon.className = props.classNameStr + '-icon';
        btn.appendChild(icon);

        return btn;
    }

    /****** btn listeners *********/
    createNew() {
        console.log('load new charts to create new porject');
    }

    openProject() {
        console.log('open existing project');
    }

    loadExamples() {
        console.log('loading examples');
    }

    saveProject() {
        console.log('save project');
    }

    exportProject() {
        console.log('export project');
    }

    revert() {
        console.log('step backward');
    }

    redo() {
        console.log('step forward');
    }
}