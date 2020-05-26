import KfGroup from "./kfGroup";
import KfItem from "./kfItem";
import { ICoord } from "../../util/ds";
import Tool from "../../util/tool";
import { state } from "../../app/state";
import { Animation } from 'canis_toolkit'

export default class KfOmit {
    static OMIT_WIDTH: number = 36;
    static OMIT_W_UNIT: number = KfOmit.OMIT_WIDTH / 6;
    static OMIT_HEIGHT: number = 20;
    static KF_OMIT: string = 'kfOmit';
    static KF_GROUP_OMIT: string = 'kfGroupOmit';
    static KF_ALIGN: string = 'kfAlign';
    static omitIdx: number = 0;

    public id: string;
    public oWidth: number = KfOmit.OMIT_WIDTH;
    public oHeight: number = KfOmit.OMIT_HEIGHT;
    public container: SVGGElement;
    public num: SVGTextElement;
    public hasOffset: boolean;
    public hasDuration: boolean;
    public iconContainer: SVGGElement;
    public parentObj: KfGroup;
    public preItem: KfItem | KfGroup;
    public startX: number;
    public startY: number;
    public omitType: string;
    public omitMergePattern: boolean[] = [];
    public omitTimingPattern: string[] = [];
    public omittedNum: number;//could be kfitem or kfgroup
    public kfIcon: SVGRectElement;
    public offsetIcon: SVGRectElement;
    public durationIcon: SVGRectElement;
    public IconComb: SVGGElement;
    // public subIconContainer1: SVGGElement;
    // public subIcon1: SVGRectElement;
    // public subOffsetIcon1: SVGRectElement;
    // public subDurationIcon1: SVGRectElement;
    // public subIconContainer2: SVGGElement;
    // public subIcon2: SVGRectElement;
    // public subOffsetIcon2: SVGRectElement;
    // public subDurationIcon2: SVGRectElement;
    public rendered: boolean = true;

    public static reset() {
        this.omitIdx = 0;
    }

    public createOmit(omitType: string, startX: number, omittedNum: number, parentObj: KfGroup, hasOffset: boolean, hasDuration: boolean, startY: number, preItemIdx: number = -1): void {
        this.omitType = omitType;
        this.hasOffset = hasOffset;
        this.hasDuration = hasDuration;
        this.parentObj = parentObj;
        this.preItem = preItemIdx === -1 ? this.parentObj.children[this.parentObj.children.length - 1] : this.parentObj.children[preItemIdx];
        this.omittedNum = omittedNum;
        this.startX = startX;
        this.startY = startY;
        this.id = `kfOmit${KfOmit.omitIdx}`;
        KfOmit.omitIdx++;

        if (typeof this.parentObj.container !== 'undefined') {
            this.renderOmit();
        }
    }

    public renderOmit() {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        console.log('render omit : ', this.container, this.preItem);
        //create thumbnail
        this.createThumbnail(this.omittedNum);
        //create dots
        this.createDots();
        this.parentObj.container.appendChild(this.container);
        if (this.parentObj.children[this.parentObj.children.length - 1] instanceof KfItem) {
            this.correctTrans(this.startY - this.oHeight / 2);
        }
        if (typeof this.parentObj.alignTarget !== 'undefined' && this.parentObj.alignType === Animation.alignTarget.withEle) {
            this.hideOmit();
        }
        this.container.setAttributeNS(null, 'transform', `translate(${this.startX + KfGroup.PADDING}, ${this.startY - this.oHeight / 2})`);
    }

    public createThumbnail(omittedNum: number): void {
        this.iconContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.iconContainer.setAttributeNS(null, 'transform', `translate(${KfOmit.OMIT_W_UNIT / 2}, 0)`);
        switch (this.omitType) {
            case KfOmit.KF_OMIT:
                this.kfIcon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                this.kfIcon.setAttributeNS(null, 'y', '0');
                this.kfIcon.setAttributeNS(null, 'fill', '#fff');
                this.kfIcon.setAttributeNS(null, 'height', `${this.oHeight}`);
                this.iconContainer.appendChild(this.kfIcon);
                break;
            case KfOmit.KF_ALIGN:
                console.log('creating align kfs omtis');
                this.oWidth = KfOmit.OMIT_WIDTH * 3;
                this.oHeight = KfOmit.OMIT_HEIGHT * 2;
                this.kfIcon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                this.kfIcon.setAttributeNS(null, 'y', '0');
                this.kfIcon.setAttributeNS(null, 'fill', '#ff0000');
                this.kfIcon.setAttributeNS(null, 'width', `${this.oWidth}`);
                this.kfIcon.setAttributeNS(null, 'height', `${this.oHeight}`);
                this.iconContainer.appendChild(this.kfIcon);
                break;
            case KfOmit.KF_GROUP_OMIT:
                this.kfIcon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                this.kfIcon.setAttributeNS(null, 'y', '0');
                this.kfIcon.setAttributeNS(null, 'fill', 'rgb(239, 239, 239)');
                this.kfIcon.setAttributeNS(null, 'stroke', '#898989');
                this.kfIcon.setAttributeNS(null, 'height', `${this.oHeight}`);
                this.kfIcon.setAttributeNS(null, 'width', `${KfOmit.OMIT_W_UNIT * 5}`);
                this.kfIcon.setAttributeNS(null, 'rx', `${KfGroup.GROUP_RX / 2}`);
                this.iconContainer.appendChild(this.kfIcon);
                break;
        }

        this.offsetIcon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.offsetIcon.setAttributeNS(null, 'x', '0');
        this.offsetIcon.setAttributeNS(null, 'y', '0');
        this.offsetIcon.setAttributeNS(null, 'fill', KfItem.OFFSET_COLOR);
        this.offsetIcon.setAttributeNS(null, 'height', `${this.oHeight}`);
        this.durationIcon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.durationIcon.setAttributeNS(null, 'y', '0');
        this.durationIcon.setAttributeNS(null, 'fill', KfItem.DURATION_COLOR);
        this.durationIcon.setAttributeNS(null, 'height', `${this.oHeight}`);
        this.iconContainer.appendChild(this.offsetIcon);
        this.iconContainer.appendChild(this.durationIcon);
        this.updateThumbnail(this.hasOffset, this.hasDuration);
        this.createNum(omittedNum);
        this.container.appendChild(this.iconContainer);
    }

    public updateThumbnail(hasOffset: boolean, hasDuration: boolean): void {
        switch (this.omitType) {
            case KfOmit.KF_OMIT:
                this.hasOffset = hasOffset;
                this.hasDuration = hasDuration;
                if (this.hasOffset) {
                    this.offsetIcon.setAttributeNS(null, 'width', `${KfOmit.OMIT_W_UNIT}`);
                    this.kfIcon.setAttributeNS(null, 'x', `${KfOmit.OMIT_W_UNIT}`);
                    if (this.hasDuration) {
                        this.kfIcon.setAttributeNS(null, 'width', `${KfOmit.OMIT_W_UNIT * 3}`);
                        this.durationIcon.setAttributeNS(null, 'x', `${KfOmit.OMIT_W_UNIT * 4}`);
                        this.durationIcon.setAttributeNS(null, 'width', `${KfOmit.OMIT_W_UNIT}`);
                    } else {
                        this.kfIcon.setAttributeNS(null, 'width', `${KfOmit.OMIT_W_UNIT * 4}`);
                        this.durationIcon.setAttributeNS(null, 'width', '0');
                    }
                } else {
                    this.offsetIcon.setAttributeNS(null, 'width', '0');
                    this.kfIcon.setAttributeNS(null, 'x', '0');
                    if (this.hasDuration) {
                        this.kfIcon.setAttributeNS(null, 'width', `${KfOmit.OMIT_W_UNIT * 4}`);
                        this.durationIcon.setAttributeNS(null, 'x', `${KfOmit.OMIT_W_UNIT * 4}`);
                        this.durationIcon.setAttributeNS(null, 'width', `${KfOmit.OMIT_W_UNIT}`);
                    } else {
                        this.kfIcon.setAttributeNS(null, 'width', `${KfOmit.OMIT_W_UNIT * 5}`);
                        this.durationIcon.setAttributeNS(null, 'width', '0');
                    }
                }
                break;
        }
    }

    /**
     * when this group is aligned to other groups, then the startX is not correct
     */
    public correctTrans(currentTransY: number): void {
        const preKfTrans: ICoord = Tool.extractTransNums(this.preItem.container.getAttributeNS(null, 'transform'));
        const preKfBBox: DOMRect = this.preItem.container.getBoundingClientRect();
        this.container.setAttributeNS(null, 'transform', `translate(${preKfTrans.x + preKfBBox.width / state.zoomLevel}, ${currentTransY})`);
    }

    public updateTrans(startX: number, startY: number): void {
        this.container.setAttributeNS(null, 'transform', `translate(${startX}, ${startY - this.oHeight / 2})`);
    }

    public createNum(omittedNum: number): void {
        this.num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.num.setAttributeNS(null, 'x', `${this.oWidth / 2}`);
        this.num.setAttributeNS(null, 'y', '15');
        this.num.setAttributeNS(null, 'font-size', '12px');
        this.num.setAttributeNS(null, 'text-anchor', 'middle');
        this.num.innerHTML = `x${omittedNum}`;
        this.iconContainer.appendChild(this.num);
    }

    public updateNum(omittedNum: number): void {
        this.omittedNum = omittedNum;
        this.num.innerHTML = `x${omittedNum}`;
    }

    public createDots(): void {
        const dots: SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dots.setAttributeNS(null, 'x', `${this.oWidth / 2}`);
        dots.setAttributeNS(null, 'y', `${this.oHeight + 10}`);
        dots.setAttributeNS(null, 'font-size', '32px');
        dots.setAttributeNS(null, 'text-anchor', 'middle');
        dots.innerHTML = '...';
        this.container.appendChild(dots);
    }

    public showOmit(): void {
        if (typeof this.container !== 'undefined') {
            this.container.setAttributeNS(null, 'opacity', '1');
        }
    }

    public hideOmit(): void {
        if (typeof this.container !== 'undefined') {
            this.container.setAttributeNS(null, 'opacity', '0');
        }
    }
}