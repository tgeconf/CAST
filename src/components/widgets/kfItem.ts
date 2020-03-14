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

    // public isContinued: boolean
    // public highlightMarks: string[]

    public treeLevel: number;

    //widgets
    public container: SVGGElement
    public kfBg: SVGRectElement
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
        const testTxt: SVGTextElement = this.drawChart(kf.marksThisKf);
        this.container.appendChild(testTxt);
        parentObj.container.appendChild(this.container);
    }

    public drawKfBg(treeLevel: number) {
        this.kfBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.kfBg.setAttributeNS(null, 'fill', '#fff');
        this.kfBg.setAttributeNS(null, 'x', '0');
        this.kfBg.setAttributeNS(null, 'y', '0');
        this.kfBg.setAttributeNS(null, 'width', `${KfItem.KF_WIDTH - treeLevel * KfItem.KF_W_STEP}`);
        this.kfBg.setAttributeNS(null, 'height', `${KfItem.KF_HEIGHT - 2 * treeLevel * KfItem.KF_H_STEP}`);
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

    public createEllipsis(): HTMLSpanElement {
        const ellipsisContainer: HTMLSpanElement = document.createElement('span');
        ellipsisContainer.className = 'ellipsis-container';
        ellipsisContainer.innerHTML = '...';
        return ellipsisContainer;
    }
}