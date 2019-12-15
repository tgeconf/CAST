import '../assets/style/nav-btn.scss';
import Util from '../util/util';

export default class NavBtn {
    public static createNavBtn(classNameStr: string, type: string, eventListener: any) {
        const btn = document.createElement('span');
        btn.className = 'nav-btn';
        btn.setAttribute('title', Util.firstLetterUppercase(type));
        btn.onclick = eventListener;

        const icon = document.createElement('span');
        icon.className = classNameStr + '-icon';
        btn.appendChild(icon);

        return btn;
    }

    public static createNavFileBtn(id: string, classNameStr:string, type: string, onchangeListener: any) {
        const btn = document.createElement('span');
        btn.className = 'nav-btn';
        btn.setAttribute('title', Util.firstLetterUppercase(type));
        btn.onclick = ()=>{
            document.getElementById(id).click();
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.id = id;
        input.style.display = 'none';
        input.onchange = onchangeListener;
        btn.appendChild(input);

        const icon = document.createElement('span');
        icon.className = classNameStr + '-icon';
        btn.appendChild(icon);

        return btn;
    }

    public static createNew() {
        console.log('load new charts to create new porject');
    }

    public static openProject() {
        console.log('open existing project');
    }

    public static loadExamples(){
        console.log('loading examples');
    }

    public static saveProject() {
        console.log('save project');
    }

    public static exportProject() {
        console.log('export project');
    }

    public static revert() {
        console.log('step backward');
    }

    public static redo() {
        console.log('step forward');
    }
}