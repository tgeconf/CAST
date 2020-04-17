import { hintTag } from "./hint";
import { ICoord } from "../../util/ds";
import Reducer from "../../app/reducer";
import * as action from "../../app/action";
import KfTrack from "./kfTrack";
import Tool from "../../util/tool";

import '../../assets/style/kfTimingIllus.scss'
import { state } from "../../app/state";

export default class KfTimingIllus {
    static BASIC_OFFSET_DURATION_W: number = 20;
    static OFFSET_COLOR: string = '#ef7b2acc';
    static OFFSET_STRETCH_COLOR: string = '#ea5514';
    static DURATION_COLOR: string = '#5e9bd4cc';
    static DURATION_STRETCH_COLOR: string = '#358bcb';
    static minDuration: number = 300;
    static maxDuration: number = 0;
    static minOffset: number = 300;
    static maxOffset: number = 0;

    public isDragging: boolean = false;
    public aniId: string;
    public parentObj: any;
    public id: number;
    public groupRef: string;

    public hasOffset: boolean = false;
    public offsetNum: number = 0;
    public _offsetDiff: number = 0;
    public offsetIllus: SVGGElement
    public offsetBg: SVGRectElement
    public offsetWidth: number = 0
    public groupRx: number = 0;
    public offsetIcon: SVGGElement

    public hasDuration: boolean = false;
    public durationNum: number = 0;
    public _durationDiff: number = 0;
    public durationIllus: SVGGElement
    public durationBg: SVGRectElement
    public durationIcon: SVGGElement
    public textWrapper: SVGGElement
    public textInput: HTMLInputElement
    public durationWidth: number = 0

    public container: SVGGElement;
    public stretchBar: SVGRectElement;

    set offsetDiff(od: number) {
        this._offsetDiff = od;
        Tool.transNodeElements(this.container, od, true);
    }
    get offsetDiff(): number {
        return this._offsetDiff;
    }

    set durationDiff(dd: number) {
        this._durationDiff = dd;
    }

    get durationDiff(): number {
        return this._durationDiff;
    }

    public addEasingTransform() { }
    public removeEasingTransform() { }

    public bindOffsetHover() {
        this.offsetIllus.onmouseover = (overEvt) => {
            if (!state.mousemoving) {
                hintTag.createHint({ x: overEvt.pageX, y: overEvt.pageY }, `delay: ${this.offsetNum}ms`);
            }
        }
        this.offsetIllus.onmouseout = () => {
            hintTag.removeHint();
        }
    }

    public unbindOffsetHover() {
        this.offsetIllus.onmouseover = null;
        this.offsetIllus.onmouseout = null;
    }

    public drawOffset(offset: number, widgetHeight: number, groupRx: number, fake: boolean = false): void {
        this.offsetNum = offset;
        this.groupRx = groupRx;
        if (KfTimingIllus.minOffset === 0) {
            this.offsetWidth = KfTimingIllus.BASIC_OFFSET_DURATION_W;
        } else {
            this.offsetWidth = KfTimingIllus.BASIC_OFFSET_DURATION_W * this.offsetNum / KfTimingIllus.minOffset;
        }
        this.offsetIllus = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.offsetBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        if (fake) {
            this.offsetBg.setAttributeNS(null, 'x', `${-KfTimingIllus.BASIC_OFFSET_DURATION_W}`);
        } else {
            this.offsetBg.setAttributeNS(null, 'x', '0');
        }
        this.offsetBg.setAttributeNS(null, 'y', '0');
        this.offsetBg.setAttributeNS(null, 'width', `${this.offsetWidth + this.groupRx}`);
        this.offsetBg.setAttributeNS(null, 'height', `${widgetHeight}`);
        this.offsetBg.setAttributeNS(null, 'fill', KfTimingIllus.OFFSET_COLOR);
        this.offsetIllus.appendChild(this.offsetBg);
        this.offsetIcon = this.drawArrowIcon({ x: this.offsetWidth / 2 - 6, y: widgetHeight / 2 - 6 });
        this.offsetIllus.appendChild(this.offsetIcon);

        //create stretchable bar
        let offsetType: string = 'offset';
        let actionInfo: any = {};
        if (this.parentObj instanceof KfTrack) {
            offsetType += '-animation';
        } else {
            if (typeof this.groupRef !== 'undefined') {//this is kfgroup
                offsetType += '-group';
                actionInfo.groupRef = this.groupRef;
            } else {//this is kfitem
                offsetType += '-kf';
            }
        }
        this.stretchBar = this.createStretchBar(widgetHeight, offsetType, actionInfo);
        this.offsetIllus.appendChild(this.stretchBar);
        this.bindOffsetHover();
    }

    public updateOffset(widgetHeight: number): void {
        this.offsetBg.setAttributeNS(null, 'height', `${widgetHeight}`);
        this.stretchBar.setAttributeNS(null, 'height', `${widgetHeight}`);
        this.offsetIcon.setAttributeNS(null, 'transform', `translate(${this.offsetWidth / 2 - 6}, ${widgetHeight / 2 - 6})`)
    }

    public bindDurationHover() {
        this.durationIllus.onmouseover = (overEvt) => {
            if (!state.mousemoving) {
                hintTag.createHint({ x: overEvt.pageX, y: overEvt.pageY }, `duration: ${this.durationNum}ms`);
            }
        }
        this.durationIllus.onmouseout = () => {
            hintTag.removeHint();
        }
    }

    public unbindDurationHover() {
        this.durationIllus.onmouseover = null;
        this.durationIllus.onmouseout = null;
    }

    public drawDuration(duration: number, widgetX: number, widgetHeight: number): void {
        this.durationNum = duration
        if (KfTimingIllus.minDuration === 0) {
            this.durationWidth = KfTimingIllus.BASIC_OFFSET_DURATION_W;
        } else {
            this.durationWidth = KfTimingIllus.BASIC_OFFSET_DURATION_W * this.durationNum / KfTimingIllus.minDuration;
        }
        this.durationIllus = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const transX: number = typeof this.offsetIllus === 'undefined' ? widgetX : widgetX + this.offsetWidth;
        this.durationIllus.setAttributeNS(null, 'transform', `translate(${transX}, 0)`);
        this.durationBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.durationBg.setAttributeNS(null, 'x', '0');
        this.durationBg.setAttributeNS(null, 'y', '0');
        this.durationBg.setAttributeNS(null, 'fill', KfTimingIllus.DURATION_COLOR);
        this.durationBg.setAttributeNS(null, 'width', `${this.durationWidth}`);
        this.durationBg.setAttributeNS(null, 'height', `${widgetHeight}`);
        this.durationIllus.appendChild(this.durationBg);
        this.durationIcon = this.drawArrowIcon({ x: this.durationWidth / 2 - 6, y: widgetHeight / 2 - 6 });
        this.durationIllus.appendChild(this.durationIcon);

        // this.createTimeText({ x: this.durationWidth / 2 - 6, y: widgetHeight / 2 - 26 });
        // this.durationIllus.appendChild(this.textWrapper);

        this.stretchBar = this.createStretchBar(widgetHeight, 'duration');
        this.durationIllus.appendChild(this.stretchBar);

        this.bindDurationHover();
    }

    // public createTimeText(trans: ICoord) {
    //     this.textWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    //     this.textWrapper.setAttributeNS(null, 'transform', `translate(${trans.x}, ${trans.y})`);
    //     const inputWrapper: SVGForeignObjectElement = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    //     inputWrapper.setAttributeNS(null, 'width', '26');
    //     inputWrapper.setAttributeNS(null, 'height', '20');
    //     this.textInput = document.createElement('input');
    //     this.textInput.classList.add('timing-text');
    //     // this.textInput.innerHTML = `${this.durationNum}`;
    //     this.textInput.setAttribute('value', `${this.durationNum}`);
    //     inputWrapper.appendChild(this.textInput);
    //     this.textWrapper.appendChild(inputWrapper);
    //     const msText: SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    //     msText.setAttributeNS(null, 'x', '26');
    //     msText.setAttributeNS(null, 'y', '16');
    //     msText.setAttributeNS(null, 'font-size', '9pt');
    //     msText.innerHTML = 'ms';
    //     this.textWrapper.appendChild(msText);
    // }

    public startAdjustingTime() { }

    public createStretchBar(barHeight: number, type: string, actionInfo: any = {}): SVGRectElement {
        //create stretchable bar
        const stretchBar: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        stretchBar.setAttributeNS(null, 'x', type === 'duration' ? `${this.durationWidth - 4}` : `${this.offsetWidth - 4}`);
        stretchBar.setAttributeNS(null, 'y', '0');
        stretchBar.setAttributeNS(null, 'width', '4');
        stretchBar.setAttributeNS(null, 'height', `${barHeight}`);
        stretchBar.setAttributeNS(null, 'fill', type === 'duration' ? KfTimingIllus.DURATION_STRETCH_COLOR : KfTimingIllus.OFFSET_STRETCH_COLOR);
        stretchBar.classList.add('ease-fade', 'stretchable-component', 'fadein-ele');

        stretchBar.onmousedown = (downEvt) => {
            Reducer.triger(action.UPDATE_MOUSE_MOVING, true);
            hintTag.removeHint();
            this.startAdjustingTime();
            this.removeEasingTransform();//eg: groupTitle
            const strectchBarBBox: DOMRect = stretchBar.getBoundingClientRect();
            const timingWidth: number = type === 'duration' ? parseFloat(this.durationBg.getAttributeNS(null, 'width')) : parseFloat(this.offsetBg.getAttributeNS(null, 'width'));
            let currentTiming: number = this.widthToTiming(timingWidth);
            if (type === 'duration') {
                hintTag.createTimingHint({ x: strectchBarBBox.left + 5, y: strectchBarBBox.top }, `duration: ${currentTiming}ms`);
                this.unbindDurationHover();
            } else {
                hintTag.createTimingHint({ x: strectchBarBBox.left + 5, y: strectchBarBBox.top }, `delay: ${currentTiming}ms`);
                this.unbindOffsetHover();
                //remove the extra width of the offset
                this.offsetBg.setAttributeNS(null, 'width', `${this.offsetWidth}`);
            }
            downEvt.stopPropagation();
            let oriPosiX: number = downEvt.pageX;
            document.onmousemove = (moveEvt) => {
                moveEvt.stopPropagation();
                const currentPosiX: number = moveEvt.pageX;
                const diffX: number = currentPosiX - oriPosiX;
                const barX: number = parseFloat(stretchBar.getAttributeNS(null, 'x'));
                const timingWidth: number = type === 'duration' ? parseFloat(this.durationBg.getAttributeNS(null, 'width')) : parseFloat(this.offsetBg.getAttributeNS(null, 'width'));
                if (timingWidth + diffX > 0) {
                    currentTiming = this.widthToTiming(timingWidth + diffX);
                    if (type === 'duration') {
                        hintTag.updateTimingHint(diffX, `duration: ${currentTiming}ms`)
                        this.durationBg.setAttributeNS(null, 'width', `${timingWidth + diffX}`);
                        this.durationDiff = diffX;
                    } else {
                        hintTag.updateTimingHint(diffX, `delay: ${currentTiming}ms`)
                        this.offsetBg.setAttributeNS(null, 'width', `${timingWidth + diffX}`);
                        //translate corresponding group or item
                        this.offsetDiff = diffX;
                    }
                    stretchBar.setAttributeNS(null, 'x', `${diffX + barX}`);
                    oriPosiX = currentPosiX;
                }
            }
            document.onmouseup = () => {
                Reducer.triger(action.UPDATE_MOUSE_MOVING, false);
                hintTag.removeTimingHint();
                document.onmousemove = null;
                document.onmouseup = null;
                this.addEasingTransform();
                //triger action to update spec
                if (type === 'duration') {
                    this.bindDurationHover();
                    const timingWidth: number = parseFloat(this.durationBg.getAttributeNS(null, 'width'));
                    Reducer.triger(action.UPDATE_DURATION, { aniId: this.aniId, duration: this.widthToTiming(timingWidth) });
                } else {
                    this.bindOffsetHover();
                    const timingWidth: number = parseFloat(this.offsetBg.getAttributeNS(null, 'width'));
                    switch (type) {
                        case 'offset-animation':
                            Reducer.triger(action.UPDATE_ANI_OFFSET, { aniId: this.aniId, offset: this.widthToTiming(timingWidth) });
                            break;
                        case 'offset-group':
                            Reducer.triger(action.UPDATE_DELAY_BETWEEN_GROUP, { aniId: this.aniId, groupRef: actionInfo.groupRef, delay: this.widthToTiming(timingWidth) });
                            break;
                        case 'offset-kf':
                            Reducer.triger(action.UPDATE_DELAY_BETWEEN_KF, { aniId: this.aniId, delay: this.widthToTiming(timingWidth) });
                            break;
                    }
                }
            }
        }
        return stretchBar;
    }

    public widthToTiming(w: number): number {
        return Math.floor(KfTimingIllus.minDuration * 100 * w / KfTimingIllus.BASIC_OFFSET_DURATION_W) / 100;
    }

    public drawArrowIcon(trans: ICoord): SVGGElement {
        const icon: SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        icon.setAttributeNS(null, 'transform', `translate(${trans.x}, ${trans.y})`);
        const iconPolygon: SVGPolygonElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        iconPolygon.setAttributeNS(null, 'fill', '#fff');
        iconPolygon.setAttributeNS(null, 'points', '10.1,0 10.1,4.1 5.6,0.1 4.3,1.5 8.3,5.1 0,5.1 0,6.9 8.3,6.9 4.3,10.5 5.6,11.9 10.1,7.9 10.1,12 12,12 12,0 ');
        icon.appendChild(iconPolygon);
        return icon;
    }


}