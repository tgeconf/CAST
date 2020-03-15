import '../../assets/style/keyframeItem.scss'
import Tool from '../../util/tool'
import { IKeyframe } from '../../app/ds';
import KfGroup from './kfGroup';

export default class KfItem {
    static KF_HEIGHT: number = 178;
    static KF_WIDTH: number = 240;
    static KF_H_STEP: number = 6;
    static KF_W_STEP: number = 8;
    static PADDING: number = 6;
    static BASIC_DURATION_W: number = 20;
    static DURATION_COLOR: string = '#5e9bd4';
    static OFFSET_COLOR: string = '#ef7b2a';
    static minDuration: number = 0;
    static maxDuration: number = 0;

    // public isContinued: boolean
    // public highlightMarks: string[]

    public treeLevel: number;

    //widgets
    public container: SVGGElement
    public kfHeight: number
    public kfBg: SVGRectElement
    public kfWidth: number
    public offsetIllus: SVGGElement
    public offsetBg: SVGRectElement
    public offsetWidth: number
    public durationIllus: SVGGElement
    public durationBg: SVGRectElement
    public durationIcon: SVGGElement
    public durationWidth: number
    public totalWidth: number = 0
    public canvas: HTMLCanvasElement

    public createItem(kf: IKeyframe, treeLevel: number, parentObj: KfGroup, startX: number): void {
        this.treeLevel = treeLevel;
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${startX + KfItem.PADDING}, ${KfItem.PADDING})`);
        // this.canvas = document.createElement('canvas');
        // this.canvas.width = 240;
        // this.canvas.height = 150;
        // Tool.svg2canvas(svg, this.canvas);
        // this.keyframeContainer.appendChild(this.canvas);
        this.drawKfBg(treeLevel);
        this.container.appendChild(this.kfBg);
        this.drawDuration(kf.duration, treeLevel);
        this.container.appendChild(this.durationIllus);
        const testTxt: SVGTextElement = this.drawChart(kf.marksThisKf);
        this.container.appendChild(testTxt);
        parentObj.container.appendChild(this.container);
    }

    public drawKfBg(treeLevel: number) {
        this.kfWidth = KfItem.KF_WIDTH - treeLevel * KfItem.KF_W_STEP;
        this.kfHeight = KfItem.KF_HEIGHT - 2 * treeLevel * KfItem.KF_H_STEP;
        this.kfBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.kfBg.setAttributeNS(null, 'fill', '#fff');
        this.kfBg.setAttributeNS(null, 'x', `${typeof this.offsetIllus === 'undefined' ? 0 : this.offsetWidth}`);
        this.kfBg.setAttributeNS(null, 'y', '0');
        this.kfBg.setAttributeNS(null, 'width', `${this.kfWidth}`);
        this.kfBg.setAttributeNS(null, 'height', `${this.kfHeight}`);
        this.totalWidth += this.kfWidth;
    }

    public drawDuration(duration: number, treeLevel: number) {
        this.durationWidth = KfItem.BASIC_DURATION_W * duration / KfItem.minDuration;
        this.durationIllus = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const transX: number = typeof this.offsetIllus === 'undefined' ? this.kfWidth : this.kfWidth + this.offsetWidth;
        this.durationIllus.setAttributeNS(null, 'transform', `translate(${transX}, 0)`);
        this.durationBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.durationBg.setAttributeNS(null, 'x', '0');
        this.durationBg.setAttributeNS(null, 'y', '0');
        this.durationBg.setAttributeNS(null, 'fill', KfItem.DURATION_COLOR);
        this.durationBg.setAttributeNS(null, 'width', `${this.durationWidth}`);
        this.durationBg.setAttributeNS(null, 'height', `${this.kfHeight}`);
        this.durationIllus.appendChild(this.durationBg);
        this.totalWidth += this.durationWidth;
        this.durationIcon = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.durationIcon.setAttributeNS(null, 'transform', `translate(${this.durationWidth / 2 - 6}, ${this.kfHeight / 2 - 6})`);
        const durationIconPolygon: SVGPolygonElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        durationIconPolygon.setAttributeNS(null, 'fill', '#fff');
        durationIconPolygon.setAttributeNS(null, 'points', '10.1,0 10.1,4.1 5.6,0.1 4.3,1.5 8.3,5.1 0,5.1 0,6.9 8.3,6.9 4.3,10.5 5.6,11.9 10.1,7.9 10.1,12 12,12 12,0 ');
        this.durationIcon.appendChild(durationIconPolygon);
        this.durationIllus.appendChild(this.durationIcon);
    }

    public drawChart(marks: string[]) {
        const txt: SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttributeNS(null, 'x', '0');
        txt.setAttributeNS(null, 'y', '50');
        for (let i = 0; i < marks.length; i += 4) {
            const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.setAttributeNS(null, 'x', '0');
            tspan.setAttributeNS(null, 'y', `${20 * i / 4 + 20}`);
            tspan.innerHTML = marks.slice(i, i + 4).join(',');
            txt.appendChild(tspan);
        }
        return txt;
    }
}