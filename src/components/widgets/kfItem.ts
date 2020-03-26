import '../../assets/style/keyframeItem.scss'
import Tool from '../../util/tool'
import { IKeyframe } from '../../app/ds';
import KfGroup from './kfGroup';
import KfTimingIllus from './kfTimingIllus';
import KfOmit from './kfOmit';
import { ICoord } from '../../util/ds';
import IntelliRefLine from './intelliRefLine';

export default class KfItem extends KfTimingIllus {
    static KF_HEIGHT: number = 178;
    static KF_WIDTH: number = 240;
    static KF_H_STEP: number = 6;
    static KF_W_STEP: number = 8;
    static PADDING: number = 6;
    static allKfInfo: Map<number, IKeyframe> = new Map();
    static allKfItems: Map<number, KfItem> = new Map();

    public id: number;
    public treeLevel: number;
    public parentObj: KfGroup;
    public rendered: boolean = false;
    public kfInfo: {
        delay: number
        duration: number
        allCurrentMarks: string[]
        allGroupMarks: string[]
        marksThisKf: string[]
        alignTo?: number
    }

    //widgets
    public container: SVGGElement
    public kfHeight: number
    public kfBg: SVGRectElement
    public kfWidth: number

    public totalWidth: number = 0
    public chartThumbnail: SVGImageElement

    public createStaticItem(staticMarks: string[]): void {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${KfItem.PADDING}, ${KfItem.PADDING})`);
        this.kfHeight = KfItem.KF_HEIGHT - 2 * KfItem.PADDING;
        this.drawKfBg(0);
        this.container.appendChild(this.kfBg);
        if (staticMarks.length > 0) {
            this.drawStaticChart(staticMarks);
            this.container.appendChild(this.chartThumbnail);
        }
    }

    public createItem(kf: IKeyframe, treeLevel: number, parentObj: KfGroup, startX: number, size?: { w: number, h: number }): void {
        this.hasOffset = kf.delayIcon;
        this.hasDuration = kf.durationIcon;
        this.parentObj = parentObj;
        if (this.parentObj.kfHasOffset !== this.hasOffset || this.parentObj.kfHasDuration !== this.hasDuration) {
            this.parentObj.updateParentKfHasTiming(this.hasOffset, this.hasDuration);
        }

        this.id = kf.id;
        this.treeLevel = treeLevel;
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${startX + KfItem.PADDING}, ${KfItem.PADDING})`);
        if (typeof size !== 'undefined') {
            this.kfHeight = size.h;
        } else {
            this.kfHeight = KfItem.KF_HEIGHT - 2 * treeLevel * KfItem.KF_H_STEP;
        }
        this.kfInfo = {
            delay: kf.delay,
            duration: kf.duration,
            allCurrentMarks: kf.allCurrentMarks,
            allGroupMarks: kf.allGroupMarks,
            marksThisKf: kf.marksThisKf,
        }
        if (typeof kf.alignTo !== 'undefined') {
            this.kfInfo.alignTo = kf.alignTo;
        }
        if (typeof parentObj.container !== 'undefined') {
            this.rendered = true;
            this.renderItem(size);
        } else {
            KfItem.allKfItems.set(this.id, this);
        }
    }

    public renderItem(size?: { w: number, h: number }) {
        if (this.hasOffset) {
            this.drawOffset(this.kfInfo.delay, this.kfHeight);
            this.container.appendChild(this.offsetIllus);
            this.totalWidth += this.offsetWidth;
        }
        this.drawKfBg(this.treeLevel, size);
        this.container.appendChild(this.kfBg);
        if (this.hasDuration) {
            this.drawDuration(this.kfInfo.duration, this.kfWidth, this.kfHeight);
            this.container.appendChild(this.durationIllus);
            this.totalWidth += this.durationWidth;
        }
        this.drawChart(this.kfInfo.allCurrentMarks, this.kfInfo.allGroupMarks, this.kfInfo.marksThisKf);
        this.container.appendChild(this.chartThumbnail);
        this.parentObj.container.appendChild(this.container);

        //if this kfItem is aligned to previous kfItems, update positions
        if (typeof this.kfInfo.alignTo !== 'undefined') {
            this.updateAlignPosi(this.kfInfo.alignTo);
            KfItem.allKfItems.set(this.id, this);
            //check whether there is already a line
            if (typeof IntelliRefLine.kfLineMapping.get(this.kfInfo.alignTo) !== 'undefined') {//already a line
                const refLineId: number = IntelliRefLine.kfLineMapping.get(this.kfInfo.alignTo).lineId;
                const oriToKf: number = IntelliRefLine.kfLineMapping.get(this.kfInfo.alignTo).theOtherEnd;
                const oriToKfBottom: number = KfItem.allKfItems.get(oriToKf).container.getBoundingClientRect().bottom;
                const currentKfBottom: number = this.container.getBoundingClientRect().bottom;
                if (currentKfBottom > oriToKfBottom) {//update the line info
                    IntelliRefLine.kfLineMapping.get(this.kfInfo.alignTo).theOtherEnd = this.id;
                    IntelliRefLine.kfLineMapping.delete(oriToKf);
                    IntelliRefLine.kfLineMapping.set(this.id, { theOtherEnd: this.kfInfo.alignTo, lineId: refLineId });
                    IntelliRefLine.updateLine(this.kfInfo.alignTo);
                }
            } else {// create a line
                let refLine: IntelliRefLine = new IntelliRefLine();
                refLine.createLine(this.kfInfo.alignTo, this.id);
            }
        } else {
            KfItem.allKfItems.set(this.id, this);
        }
    }

    public updateAlignPosi(alignTo: number) {
        //use bbox to compare position
        const currentPosiX: number = this.container.getBoundingClientRect().left;
        const alignedKfInfo: IKeyframe = KfItem.allKfInfo.get(alignTo);
        const alignedKfItem: KfItem = KfItem.allKfItems.get(alignTo);
        const alignedKfBgX: number = alignedKfItem.kfBg.getBoundingClientRect().left;
        const bgDiffX: number = Math.abs(currentPosiX - alignedKfBgX);
        if (currentPosiX > alignedKfBgX) { //translate aligned kf and its group
            let posiXForNextKf: number = this.container.getBoundingClientRect().right;

            //update aligned kfs, together with those kfs after it, and those in its parent group
            const currentAlignedKfTransX: number = Tool.extractTransNums(alignedKfItem.container.getAttributeNS(null, 'transform')).x;
            alignedKfItem.container.setAttributeNS(null, 'transform', `translate(${currentAlignedKfTransX + bgDiffX}, ${KfItem.PADDING})`);
            const alignedKfItemBBox: DOMRect = alignedKfItem.container.getBoundingClientRect();
            if (alignedKfItemBBox.right > posiXForNextKf) {
                posiXForNextKf = alignedKfItemBBox.right;
            }
            //update kfs and their groups aligned to alignedKfItem
            if (typeof alignedKfInfo.alignWithKfs !== 'undefined') {
                alignedKfInfo.alignWithKfs.forEach((kfId: number) => {
                    const tmpKfItem = KfItem.allKfItems.get(kfId);
                    if (typeof tmpKfItem !== 'undefined') {
                        tmpKfItem.parentObj.translateGroup(tmpKfItem, bgDiffX);
                        const tmpKfItemBBox: DOMRect = tmpKfItem.container.getBoundingClientRect();
                        if (tmpKfItemBBox.right > posiXForNextKf) {
                            posiXForNextKf = tmpKfItemBBox.right;
                        }
                    }
                })
            }
            //find the next kf in aligned group
            let flag: boolean = false;
            let transXForNextKf: number = 0;
            let nextKf: KfItem;
            for (let i: number = 0, len: number = alignedKfItem.parentObj.children.length; i < len; i++) {
                const c: KfItem | KfOmit = alignedKfItem.parentObj.children[i];
                if (flag) {
                    if (c instanceof KfOmit) {
                        transXForNextKf = bgDiffX;
                        const tmpTrans: ICoord = Tool.extractTransNums(c.container.getAttributeNS(null, 'transform'));
                        c.container.setAttributeNS(null, 'transform', `translate(${tmpTrans.x + transXForNextKf}, ${tmpTrans.y})`);
                    } else {
                        if (c.container.getBoundingClientRect().left + transXForNextKf < posiXForNextKf) {
                            transXForNextKf = posiXForNextKf - c.container.getBoundingClientRect().left;
                        }
                        nextKf = c;
                        break;
                    }
                }
                if (c instanceof KfItem) {
                    flag = c.id === alignedKfItem.id
                }
            }

            //update position of next kf in aligned group
            if (transXForNextKf > 0) {
                nextKf.parentObj.translateGroup(nextKf, transXForNextKf, true);
            }
        } else {//translate current kf
            const currentTransX: number = Tool.extractTransNums(this.container.getAttributeNS(null, 'transform')).x;
            this.container.setAttributeNS(null, 'transform', `translate(${currentTransX + bgDiffX}, ${KfItem.PADDING})`);
            this.totalWidth += bgDiffX;
        }
        //update the refline
        IntelliRefLine.updateLine(alignTo);
    }

    public drawKfBg(treeLevel: number, size?: { w: number, h: number }): void {
        if (typeof size !== 'undefined') {
            this.kfWidth = size.w;
        } else {
            this.kfWidth = KfItem.KF_WIDTH - treeLevel * KfItem.KF_W_STEP;
        }
        this.kfBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.kfBg.setAttributeNS(null, 'fill', '#fff');
        this.kfBg.setAttributeNS(null, 'x', `${typeof this.offsetIllus === 'undefined' ? 0 : this.offsetWidth}`);
        this.kfBg.setAttributeNS(null, 'y', '0');
        this.kfBg.setAttributeNS(null, 'width', `${this.kfWidth}`);
        this.kfBg.setAttributeNS(null, 'height', `${this.kfHeight}`);
        this.totalWidth += this.kfWidth;
    }

    public drawStaticChart(staticMarks: string[]) {
        const svg: HTMLElement = document.getElementById('visChart');
        Array.from(svg.getElementsByClassName('mark')).forEach((m: HTMLElement) => {
            if (!staticMarks.includes(m.id)) {
                m.setAttributeNS(null, '_opacity', m.getAttributeNS(null, 'opacity') ? m.getAttributeNS(null, 'opacity') : '1');
                m.setAttributeNS(null, 'opacity', '0');
                m.classList.add('translucent-mark');
            }
        })
        this.renderChartToCanvas(svg);
        Array.from(svg.getElementsByClassName('translucent-mark')).forEach((m: HTMLElement) => {
            m.classList.remove('translucent-mark');
            m.setAttributeNS(null, 'opacity', m.getAttributeNS(null, '_opacity'));
        })
    }

    public drawChart(allMarks: string[], allGroupMarks: string[], marksThisKf: string[]): void {
        const svg: HTMLElement = document.getElementById('visChart');
        Array.from(svg.getElementsByClassName('mark')).forEach((m: HTMLElement) => {
            if (!allMarks.includes(m.id) && !marksThisKf.includes(m.id)) {
                m.setAttributeNS(null, '_opacity', m.getAttributeNS(null, 'opacity') ? m.getAttributeNS(null, 'opacity') : '1');
                m.setAttributeNS(null, 'opacity', '0');
                m.classList.add('translucent-mark');
            } else if (allMarks.includes(m.id) && !marksThisKf.includes(m.id) && !allGroupMarks.includes(m.id)) {
                m.setAttributeNS(null, '_opacity', m.getAttributeNS(null, 'opacity') ? m.getAttributeNS(null, 'opacity') : '1');
                m.setAttributeNS(null, 'opacity', '0.4');
                m.classList.add('translucent-mark');
            }
        })
        this.renderChartToCanvas(svg);
        Array.from(svg.getElementsByClassName('translucent-mark')).forEach((m: HTMLElement) => {
            m.classList.remove('translucent-mark');
            m.setAttributeNS(null, 'opacity', m.getAttributeNS(null, '_opacity'));
        })
    }

    public renderChartToCanvas(svg: HTMLElement): void {
        const imgSrc: string = Tool.svg2url(svg);
        this.chartThumbnail = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        this.chartThumbnail.setAttributeNS(null, 'x', `${typeof this.offsetIllus === 'undefined' ? 0 : this.offsetWidth}`);
        this.chartThumbnail.setAttributeNS(null, 'y', '0');
        this.chartThumbnail.setAttributeNS(null, 'width', `${this.kfWidth}`);
        this.chartThumbnail.setAttributeNS(null, 'height', `${this.kfHeight}`);
        this.chartThumbnail.setAttributeNS(null, 'href', imgSrc);
    }
}