import KfGroup from "./kfGroup";
import KfItem from "./kfItem";

export default class KfOmit {
    static OMIT_W: number = 36;
    static OMIT_W_UNIT: number = KfOmit.OMIT_W / 6;
    static OMIT_H: number = 20;
    public container: SVGGElement;
    public num: SVGTextElement;
    public hasOffset: boolean;
    public hasDuration: boolean;
    public iconContainer: SVGGElement;
    public parentObj: KfGroup;
    public startX: number;
    public startY: number;
    public omittedKfNum: number;
    public kfIcon: SVGRectElement;
    public offsetIcon: SVGRectElement;
    public durationIcon: SVGRectElement;
    public createOmit(startX: number, omittedKfNum: number, parentObj: KfGroup, hasOffset: boolean, hasDuration: boolean, startY: number = 0): void {
        this.hasOffset = hasOffset;
        this.hasDuration = hasDuration;
        this.parentObj = parentObj;
        this.omittedKfNum = omittedKfNum;
        this.startX = startX;
        this.startY = startY;

        if (typeof this.parentObj.container !== 'undefined') {
            this.renderOmit();
        }
    }

    public renderOmit() {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${this.startX + KfGroup.PADDING}, ${this.startY - KfOmit.OMIT_H / 2})`);
        //create thumbnail
        this.createThumbnail(this.omittedKfNum);
        //create dots
        this.createDots();
        this.parentObj.container.appendChild(this.container);
    }

    public createThumbnail(omittedKfNum: number): void {
        this.iconContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.iconContainer.setAttributeNS(null, 'transform', `translate(${KfOmit.OMIT_W_UNIT / 2}, 0)`);
        this.kfIcon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.kfIcon.setAttributeNS(null, 'y', '0');
        this.kfIcon.setAttributeNS(null, 'fill', '#fff');
        this.kfIcon.setAttributeNS(null, 'height', `${KfOmit.OMIT_H}`);
        this.offsetIcon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.offsetIcon.setAttributeNS(null, 'x', '0');
        this.offsetIcon.setAttributeNS(null, 'y', '0');
        this.offsetIcon.setAttributeNS(null, 'fill', KfItem.OFFSET_COLOR);
        this.offsetIcon.setAttributeNS(null, 'height', `${KfOmit.OMIT_H}`);
        this.durationIcon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.durationIcon.setAttributeNS(null, 'y', '0');
        this.durationIcon.setAttributeNS(null, 'fill', KfItem.DURATION_COLOR);
        this.durationIcon.setAttributeNS(null, 'height', `${KfOmit.OMIT_H}`);
        this.iconContainer.appendChild(this.offsetIcon);
        this.iconContainer.appendChild(this.kfIcon);
        this.iconContainer.appendChild(this.durationIcon);
        this.updateThumbnail(this.hasOffset, this.hasDuration);
        this.createNum(omittedKfNum);
        this.container.appendChild(this.iconContainer);
    }

    public updateThumbnail(hasOffset: boolean, hasDuration: boolean): void {
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
    }

    public updateTrans(startX: number, startY: number): void {
        this.container.setAttributeNS(null, 'transform', `translate(${startX + KfGroup.PADDING}, ${startY - KfOmit.OMIT_H / 2})`);
    }

    public createNum(omittedKfNum: number): void {
        this.num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.num.setAttributeNS(null, 'x', `${KfOmit.OMIT_W_UNIT * 5 / 2}`);
        this.num.setAttributeNS(null, 'y', '15');
        this.num.setAttributeNS(null, 'font-size', '12px');
        this.num.setAttributeNS(null, 'text-anchor', 'middle');
        this.num.innerHTML = `x${omittedKfNum}`;
        this.iconContainer.appendChild(this.num);
    }

    public updateNum(omittedKfNum: number): void {
        this.num.innerHTML = `x${omittedKfNum}`;
    }

    public createDots(): void {
        const dots: SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dots.setAttributeNS(null, 'x', `${KfOmit.OMIT_W / 2}`);
        dots.setAttributeNS(null, 'y', `${KfOmit.OMIT_H + 10}`);
        dots.setAttributeNS(null, 'font-size', '32px');
        dots.setAttributeNS(null, 'text-anchor', 'middle');
        dots.innerHTML = '...';
        this.container.appendChild(dots);
    }
}