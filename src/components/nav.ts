import '../assets/style/nav.scss'
import LogoImg from '../assets/img/logo.png'
import Tool from '../util/tool'
import FloatingWindow from './floatingWindow'
import Reducer from '../app/reducer';
import * as action from '../app/action';
import { State, state } from '../app/state';
import { ViewContent } from './viewWindow';
import { Loading } from './widgets/loading';

export default class Nav {
    navContainer: HTMLDivElement;

    public createNav() {
        this.navContainer = document.createElement('div');
        this.navContainer.className = 'nav';

        // create logo contianer
        const logoContainer: HTMLSpanElement = document.createElement('span');
        logoContainer.className = 'logo-container';
        const logo: HTMLImageElement = new Image();
        logo.src = LogoImg;
        logoContainer.appendChild(logo);
        const logoText: HTMLSpanElement = document.createElement('span');
        logoText.textContent = 'CAST';
        logoText.className = 'title';
        logoContainer.appendChild(logoText);
        this.navContainer.appendChild(logoContainer);

        this.navContainer.appendChild(this.createSeparator());

        // create buttons
        this.navContainer.appendChild(new NavBtn().createNavFileBtn({
            inputId: 'createNew',
            classNameStr: 'new',
            title: 'load chart',
            evtType: NavBtn.CREATE_NEW
        }));
        this.navContainer.appendChild(new NavBtn().createNavBtn({
            classNameStr: 'open',
            title: 'open project',
            evtType: NavBtn.OPEN_PROJECT
        }));
        this.navContainer.appendChild(new NavBtn().createNavBtn({
            classNameStr: 'save',
            title: 'save project',
            evtType: NavBtn.SAVE_PROJECT
        }));
        this.navContainer.appendChild(new NavBtn().createNavBtn({
            classNameStr: 'export',
            title: 'export Lottie',
            evtType: NavBtn.EXPORT_LOTTIE
        }));
        this.navContainer.appendChild(this.createSeparator());
        this.navContainer.appendChild(new NavBtn().createNavBtn({
            classNameStr: 'revert',
            title: 'revert',
            evtType: NavBtn.REVERT
        }));
        this.navContainer.appendChild(new NavBtn().createNavBtn({
            classNameStr: 'redo',
            title: 'redo',
            evtType: NavBtn.REDO
        }));
        this.navContainer.appendChild(this.createSeparator());
        this.navContainer.appendChild(new NavBtn().createNavBtn({
            classNameStr: 'reset',
            title: 'reset',
            evtType: NavBtn.RESET
        }));
        this.navContainer.appendChild(this.createSeparator());

        const testBtn: HTMLButtonElement = document.createElement('button');
        // testBtn.innerHTML = 'testSpec';
        testBtn.innerHTML = 'testGif';
        testBtn.onclick = () => {
            // NavBtn.testSpec();
            NavBtn.testGif();
        }
        // this.navContainer.appendChild(testBtn);
    }

    public createSeparator() {
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
    // static vars
    static CREATE_NEW: string = 'createNew';
    static OPEN_PROJECT: string = 'openProject';
    static SAVE_PROJECT: string = 'saveProject';
    static LOAD_EXAMPLES: string = 'loadExamples';
    static EXPORT_LOTTIE: string = 'exportLottie';
    static REVERT: string = 'revert';
    static REDO: string = 'redo';
    static RESET: string = 'reset';

    /**
     * create buttons whose event listeners are not file related
     * @param props 
     */
    createNavBtn(props: INavBtnProps): HTMLSpanElement {
        const btn: HTMLSpanElement = document.createElement('span');
        btn.className = 'nav-btn';
        btn.setAttribute('title', Tool.firstLetterUppercase(props.title));
        switch (props.evtType) {
            case NavBtn.OPEN_PROJECT:
                btn.onclick = () => this.openProject();
                break;
            case NavBtn.SAVE_PROJECT:
                btn.onclick = () => this.saveProject();
                break;
            case NavBtn.EXPORT_LOTTIE:
                btn.onclick = () => this.exportLottie();
                break;
            case NavBtn.REVERT:
                btn.onclick = () => this.revert();
                break;
            case NavBtn.REDO:
                btn.onclick = () => this.redo();
                break;
            case NavBtn.RESET:
                btn.onclick = () => this.reset();
                break;
        }

        const icon: HTMLElement = document.createElement('span');
        icon.className = props.classNameStr + '-icon';
        btn.appendChild(icon);

        return btn;
    }

    /**
     * create buttons whose event listeners are file related
     * @param props
     */
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
                // input.onchange = () => this.createNew();
                input.onchange = () => {
                    let chartFile = input.files[0];
                    var fr = new FileReader();
                    fr.readAsText(chartFile);
                    fr.onload = function () {
                        const chart: string = <string>fr.result;
                        // console.log('chart is: ', chart);
                        Reducer.triger(action.UPDATE_LOADING_STATUS, { il: true, srcDom: document.getElementById(ViewContent.VIDEO_VIEW_CONTENT_ID), content: Loading.LOADING });
                        setTimeout(() => {
                            //reset state history
                            State.stateHistoryIdx = -1;
                            State.stateHistory = [];
                            State.tmpStateBusket = [];
                            State.tmpStateBusket.push({
                                historyAction: { actionType: action.LOAD_CHARTS, actionVal: state.charts },
                                currentAction: { actionType: action.LOAD_CHARTS, actionVal: [chart] }
                            })
                            State.saveHistory();
                            Reducer.triger(action.LOAD_CHARTS, [chart]);
                        }, 1);
                    }
                }
                break;
            // case NavBtn.OPEN_PROJECT:
            //     input.onchange = () => this.openProject();
            //     break;
        }
        btn.appendChild(input);

        const icon: HTMLSpanElement = document.createElement('span');
        icon.className = props.classNameStr + '-icon';
        btn.appendChild(icon);

        return btn;
    }

    // btn listeners
    public createNew() {
        console.log('load new charts to create new porject');

    }

    public openProject() {
        const floatingWindow: FloatingWindow = new FloatingWindow();
        floatingWindow.createFloatingWindow(FloatingWindow.TYPE_EXAMPLE);
        document.getElementById('appWrapper').appendChild(floatingWindow.floatingWindow);
    }

    public saveProject() {
        console.log('save project');

        const outputObj = {
            spec: state.spec
        }

        const file = new Blob([JSON.stringify(outputObj, null, 2)], { type: 'application/json' });
        const fileName = 'canis_project.cpro';
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, fileName);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    public exportLottie() {
        console.log('export lottie');
        const file = new Blob([JSON.stringify(state.lottieSpec, null, 2)], { type: 'application/json' });
        const fileName = 'animatedChart.json';
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, fileName);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    public revert(): void {
        console.log('step backward');
        Reducer.triger(action.UPDATE_LOADING_STATUS, { il: true, srcDom: document.getElementById(ViewContent.VIDEO_VIEW_CONTENT_ID), content: Loading.LOADING })
        setTimeout(() => {
            State.revertHistory();
            Loading.removeLoading();
        }, 1);
    }

    public redo(): void {
        console.log('step forward');
        Reducer.triger(action.UPDATE_LOADING_STATUS, { il: true, srcDom: document.getElementById(ViewContent.VIDEO_VIEW_CONTENT_ID), content: Loading.LOADING })
        setTimeout(() => {
            State.redoHistory();
            Loading.removeLoading();
        }, 1);
    }

    public reset(): void {
        Reducer.triger(action.RESET_STATE, {});
    }

    public static testSpec(): void {
        const floatingWindow: FloatingWindow = new FloatingWindow();
        floatingWindow.createFloatingWindow(FloatingWindow.TYPE_SPEC);
        document.getElementById('appWrapper').appendChild(floatingWindow.floatingWindow);
    }

    public static async testGif() {
        console.log(state.lottieSpec);
        // // const gif = new LottieRenderer();
        // await LottieRenderer({
        //     animationData: state.lottieSpec,
        //     // path: 'fixtures/bodymovin.json',
        //     output: 'example.gif',
        //     width: 640
        // })
    }
}