import { ICoord } from "../../util/ds";
import { KfContainer } from "../kfContainer";
import Tool from "../../util/tool";

export class Hint {
    static CHAR_LEN: number = 7;
    static HINT_HEIGHT: number = 12;
    static PADDING: number = 2;
    static FILL_COLOR: string = '#fff';
    static STROKE_COLOR: string = '#000';
    static TIMING_FILL_COLOR: string = '#383838';
    static TIMING_HINT_HEIGHT: number = 21;

    public hintContent: string = '';
    public container: SVGGElement;
    public hintBg: SVGRectElement;
    public contentText: SVGTextElement;
    public pointer: SVGPathElement;
    public content: string = '';

    public createHint(mousePosi: ICoord, content: string): void {
        this.removeHint();
        this.removeTimingHint();
        this.content = content;
        const svgHintLayer: HTMLElement = document.getElementById(KfContainer.KF_HINT);
        const hintLayerBBox: DOMRect = svgHintLayer.getBoundingClientRect();
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${mousePosi.x - hintLayerBBox.left + 4}, ${mousePosi.y - hintLayerBBox.top + 2})`);
        this.hintBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.hintBg.setAttributeNS(null, 'width', `${Hint.CHAR_LEN * this.content.length}`);
        this.hintBg.setAttributeNS(null, 'height', `${Hint.HINT_HEIGHT + 2 * Hint.PADDING}`);
        this.hintBg.setAttributeNS(null, 'fill', `${Hint.FILL_COLOR}`);
        this.hintBg.setAttributeNS(null, 'stroke', `${Hint.STROKE_COLOR}`);
        this.container.appendChild(this.hintBg);
        this.contentText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.contentText.setAttributeNS(null, 'x', `${Hint.PADDING}`);
        this.contentText.setAttributeNS(null, 'y', `${Hint.HINT_HEIGHT}`);
        // this.contentText.setAttributeNS(null, 'font-size', '9pt');
        this.contentText.classList.add('monospace-font', 'small-font');
        this.contentText.innerHTML = this.content;
        this.container.appendChild(this.contentText);
        svgHintLayer.appendChild(this.container);

        document.onmousemove = (moveEvt) => {
            this.container.setAttributeNS(null, 'transform', `translate(${moveEvt.pageX - hintLayerBBox.left + 4}, ${moveEvt.pageY - hintLayerBBox.top + 2})`);
        }
    }

    public removeHint() {
        const svgHintLayer: HTMLElement = document.getElementById(KfContainer.KF_HINT);
        if (svgHintLayer.contains(this.container)) {
            svgHintLayer.removeChild(this.container);
        }
        document.onmousemove = null;
    }

    public createTimingHint(pointingPosi: ICoord, content: string): void {
        this.removeHint();
        this.removeTimingHint();
        this.content = content;
        const svgHintLayer: HTMLElement = document.getElementById(KfContainer.KF_HINT);
        const hintLayerBBox: DOMRect = svgHintLayer.getBoundingClientRect();
        const hintWidth: number = Hint.CHAR_LEN * this.content.length + 2 * Hint.PADDING;
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${pointingPosi.x - hintLayerBBox.left - hintWidth / 2}, ${pointingPosi.y - hintLayerBBox.top - Hint.TIMING_HINT_HEIGHT})`);
        const hintBg: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        hintBg.setAttributeNS(null, 'width', `${hintWidth}`);
        hintBg.setAttributeNS(null, 'height', `${Hint.HINT_HEIGHT + 2 * Hint.PADDING}`);
        hintBg.setAttributeNS(null, 'fill', `${Hint.TIMING_FILL_COLOR}`);
        this.container.appendChild(hintBg);
        this.contentText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.contentText.setAttributeNS(null, 'x', `${Hint.PADDING}`);
        this.contentText.setAttributeNS(null, 'y', `${Hint.HINT_HEIGHT}`);
        // this.contentText.setAttributeNS(null, 'font-size', '9pt');
        this.contentText.classList.add('monospace-font', 'small-font');
        this.contentText.setAttributeNS(null, 'fill', '#fff');
        this.contentText.innerHTML = this.content;
        this.container.appendChild(this.contentText);
        this.pointer = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.pointer.setAttributeNS(null, 'd', `M0,0 H6 L3,${Hint.TIMING_HINT_HEIGHT - Hint.HINT_HEIGHT - 2 * Hint.PADDING} Z`);
        this.pointer.setAttributeNS(null, 'transform', `translate(${hintWidth / 2 - 6}, ${Hint.HINT_HEIGHT + 2 * Hint.PADDING})`);
        this.pointer.setAttributeNS(null, 'fill', `${Hint.TIMING_FILL_COLOR}`);
        this.container.appendChild(this.pointer);
        svgHintLayer.appendChild(this.container);
    }

    public updateTimingHint(diffX: number, content: string) {
        this.content = content;
        this.contentText.innerHTML = this.content;
        const containerTrans: ICoord = Tool.extractTransNums(this.container.getAttributeNS(null, 'transform'));
        const newW: number = Hint.CHAR_LEN * this.content.length + 2 * Hint.PADDING;
        const oriW: number = parseFloat(this.hintBg.getAttributeNS(null, 'width'));
        const diffW: number = newW - oriW;
        this.hintBg.setAttributeNS(null, 'width', `${newW}`);
        this.container.setAttributeNS(null, 'transform', `translate(${containerTrans.x + diffX - diffW / 2}, ${containerTrans.y})`);
        this.pointer.setAttributeNS(null, 'transform', `translate(${newW / 2 - 6}, ${Hint.HINT_HEIGHT + 2 * Hint.PADDING})`);
    }

    public removeTimingHint() {
        const svgHintLayer: HTMLElement = document.getElementById(KfContainer.KF_HINT);
        if (svgHintLayer.contains(this.container)) {
            svgHintLayer.removeChild(this.container);
        }
    }
}

export let hintTag: Hint = new Hint();