import KfGroup from "./kfGroup";
import { Animation, ChartSpec } from 'canis_toolkit';
import Tool from "../../util/tool";

export default class PlusBtn {
    static BTN_SIZE: number = 16;
    static PADDING: number = 6;
    static BTN_COLOR: string = '#9fa0a0';
    static BTN_HIGHLIGHT_COLOR: string = '#358bcb';
    static BTN_DRAGOVER_COLOR: string = '#ea5514';
    static allPlusBtn: PlusBtn[] = [];
    static dragoverBtn: PlusBtn;
    static BTN_IDX: number = 0;

    public parentObj: KfGroup;
    public id: number;
    public kfSize: { w: number, h: number }
    public acceptableCls: string[];
    public isHighlighted: boolean = false;
    public container: SVGGElement;
    public btnBg: SVGRectElement;
    public btnIcon: SVGTextElement;

    public static highlightPlusBtns(selectedCls: string[]) {
        //filter which button to highlight (has the same accepatable classes)
        this.allPlusBtn.forEach((pb: PlusBtn) => {
            if (Tool.arrayContained(pb.acceptableCls, selectedCls)) {
                pb.highlightBtn();
                let transX: number = pb.kfSize.w - this.BTN_SIZE;
                pb.parentObj.translateGroup(pb, transX, true);
            }
        })
    }

    public static cancelHighlightPlusBtns() {
        this.allPlusBtn.forEach((pb: PlusBtn) => {
            if (pb.isHighlighted) {
                pb.cancelHighlightBtn();
                let transX: number = pb.kfSize.w - this.BTN_SIZE;
                pb.parentObj.translateGroup(pb, -transX, true);
            }
        })
    }

    public static detectAdding(kfs: any[]): [boolean, string[]] {
        const kf0Marks = kfs[0].marksThisKf;
        let mClassCount: string[] = [];
        kf0Marks.forEach((mId: string) => {
            mClassCount.push(Animation.markClass.get(mId));
        })
        mClassCount = [...new Set(mClassCount)];
        if (mClassCount.length === 1) {
            let allDataEncoded: boolean = true;
            let hasDiffAttrValue: boolean = false;
            let datum0: any = ChartSpec.dataMarkDatum.get(kf0Marks[0]);
            for (let i = 1, len = kf0Marks.length; i < len; i++) {
                if (typeof ChartSpec.dataMarkDatum.get(kf0Marks[i]) === 'undefined') {
                    allDataEncoded = false;
                    break;
                } else {
                    const datum: any = ChartSpec.dataMarkDatum.get(kf0Marks[i]);
                    for (let key in datum) {
                        if (datum[key] !== datum0[key] && typeof datum0[key] !== 'undefined') {
                            hasDiffAttrValue = true;
                        }
                    }
                    if (hasDiffAttrValue) {
                        break;
                    }
                }
            }
            if (hasDiffAttrValue || (kfs.length === 1 && kf0Marks.length > 1)) {
                return [true, mClassCount];
            } else {
                return [false, []]
            }
        } else {
            return [true, mClassCount];
        }
    }

    public createBtn(parentObj: KfGroup, kfSize: { w: number, h: number }, acceptableCls: string[]) {
        this.parentObj = parentObj;
        this.kfSize = kfSize;
        this.id = PlusBtn.BTN_IDX;
        PlusBtn.BTN_IDX++;
        this.acceptableCls = acceptableCls;
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${this.parentObj.offsetWidth + PlusBtn.PADDING},${PlusBtn.PADDING + this.kfSize.h / 2 - PlusBtn.BTN_SIZE / 2})`);
        this.btnBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.btnBg.setAttributeNS(null, 'x', '0');
        this.btnBg.setAttributeNS(null, 'y', '0');
        this.btnBg.setAttributeNS(null, 'width', `${PlusBtn.BTN_SIZE}`);
        this.btnBg.setAttributeNS(null, 'height', `${PlusBtn.BTN_SIZE}`);
        this.btnBg.setAttributeNS(null, 'rx', `${PlusBtn.BTN_SIZE / 2}`);
        this.btnBg.setAttributeNS(null, 'fill', 'none');
        this.btnBg.setAttributeNS(null, 'stroke', `${PlusBtn.BTN_COLOR}`);
        this.btnBg.setAttributeNS(null, 'stroke-dasharray', '4 3');
        this.container.appendChild(this.btnBg);
        this.btnIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.btnIcon.setAttributeNS(null, 'text-anchor', 'middle');
        this.btnIcon.setAttributeNS(null, 'x', `${PlusBtn.BTN_SIZE / 2}`);
        this.btnIcon.setAttributeNS(null, 'y', `${PlusBtn.BTN_SIZE / 2 + 6}`);
        this.btnIcon.setAttributeNS(null, 'fill', `${PlusBtn.BTN_COLOR}`);
        this.btnIcon.setAttributeNS(null, 'font-size', '16pt');
        this.btnIcon.innerHTML = '+';
        this.container.appendChild(this.btnIcon);
        if (this.parentObj.treeLevel === 0) {
            this.parentObj.container.insertBefore(this.container, this.parentObj.groupMenu.container);
        } else {
            this.parentObj.container.appendChild(this.container);
        }
        this.container.onmouseover = () => {
            console.log('over!');
        }
        this.container.onmouseout = () => {
            console.log('out!');
        }
        this.container.ondragover = () => {
            console.log('dsadsaewq!');
        }
        PlusBtn.allPlusBtn.push(this);
    }

    public highlightBtn() {
        this.isHighlighted = true;
        this.container.setAttributeNS(null, 'transform', `translate(${this.parentObj.offsetWidth + PlusBtn.PADDING},${PlusBtn.PADDING})`);
        this.btnBg.setAttributeNS(null, 'width', `${this.kfSize.w}`);
        this.btnBg.setAttributeNS(null, 'height', `${this.kfSize.h}`);
        this.btnBg.setAttributeNS(null, 'stroke', `${PlusBtn.BTN_HIGHLIGHT_COLOR}`);
        this.btnIcon.setAttributeNS(null, 'x', `${this.kfSize.w / 2}`);
        this.btnIcon.setAttributeNS(null, 'y', `${this.kfSize.h / 2 + 6}`);
        this.btnIcon.setAttributeNS(null, 'fill', `${PlusBtn.BTN_HIGHLIGHT_COLOR}`);
    }

    public cancelHighlightBtn() {
        this.isHighlighted = false;
        this.container.setAttributeNS(null, 'transform', `translate(${this.parentObj.offsetWidth + PlusBtn.PADDING},${PlusBtn.PADDING + this.kfSize.h / 2 - PlusBtn.BTN_SIZE / 2})`);
        this.btnBg.setAttributeNS(null, 'width', `${PlusBtn.BTN_SIZE}`);
        this.btnBg.setAttributeNS(null, 'height', `${PlusBtn.BTN_SIZE}`);
        this.btnBg.setAttributeNS(null, 'stroke', `${PlusBtn.BTN_COLOR}`);
        this.btnIcon.setAttributeNS(null, 'x', `${PlusBtn.BTN_SIZE / 2}`);
        this.btnIcon.setAttributeNS(null, 'y', `${PlusBtn.BTN_SIZE / 2 + 6}`);
        this.btnIcon.setAttributeNS(null, 'fill', `${PlusBtn.BTN_COLOR}`);
    }

    public dragSelOver() {
        console.log('in dragover');
        this.btnBg.setAttributeNS(null, 'stroke', `${PlusBtn.BTN_DRAGOVER_COLOR}`);
        this.btnIcon.setAttributeNS(null, 'fill', `${PlusBtn.BTN_DRAGOVER_COLOR}`);
        PlusBtn.dragoverBtn = this;
    }

    public dragSelOut() {
        console.log('in drag out');
        this.btnBg.setAttributeNS(null, 'stroke', `${PlusBtn.BTN_HIGHLIGHT_COLOR}`);
        this.btnIcon.setAttributeNS(null, 'fill', `${PlusBtn.BTN_HIGHLIGHT_COLOR}`);
        PlusBtn.dragoverBtn = undefined;
    }

    public dropOnBtn() {

    }
}